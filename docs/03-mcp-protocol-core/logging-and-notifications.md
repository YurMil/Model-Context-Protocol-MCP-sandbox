# MCP Protocol: Structured Logging, Progress & Cancellation

Beyond basic tool invocation, production-grade MCP hosts and servers coordinate operation states through **Structured Logging**, **Progress Notifications**, and **Request Cancellation**.

---

## 🪵 1. Structured Logging Protocol

### Why Standard Console Logs Are Insufficient
- **`stdout` hazard**: Writing directly to standard output (`console.log`, `print()`) in a `stdio` transport corrupts JSON-RPC 2.0 frames, causing instant parser crashes.
- **`stderr` limitations**: While standard error (`stderr`) is safe from JSON-RPC corruption, it is raw, unformatted text that host clients cannot reliably filter, search, or categorize by severity.

### MCP Logging Architecture
The MCP logging protocol provides bidirectional log level negotiation and structured JSON-RPC log messages.

```
┌──────────────────┐                               ┌──────────────────┐
│    MCP Client    │─── logging/setLevel (info) ──►│    MCP Server    │
│                  │◄── notifications/message ─────│                  │
└──────────────────┘    (level: "info", data: ...) └──────────────────┘
```

#### Client Sets Log Level (`logging/setLevel`)
The client configures the minimum log severity it wishes to receive:
```json
{
  "jsonrpc": "2.0",
  "method": "logging/setLevel",
  "params": {
    "level": "info"
  }
}
```

#### Server Emits Structured Log (`notifications/message`)
The server sends notifications matching RFC-5424 severity levels:
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/message",
  "params": {
    "level": "info",
    "logger": "database-connector",
    "data": "Connected to PostgreSQL database at localhost:5432"
  }
}
```

#### Standard Severity Levels (RFC-5424)
`debug` < `info` < `notice` < `warning` < `error` < `critical` < `alert` < `emergency`

### Implementation Example (TypeScript)
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "logging-demo", version: "1.0.0" });

server.tool("sync_records", "Syncs records", {}, async (args, extra) => {
  // Send structured log to the host
  await server.server.sendLoggingMessage({
    level: "info",
    logger: "sync_service",
    data: "Starting synchronization batch..."
  });

  return { content: [{ type: "text", text: "Synced 100 records." }] };
});
```

### Implementation Example (Python FastMCP)
```python
from mcp.server.fastmcp import FastMCP, Context

mcp = FastMCP("logging-demo")

@mcp.tool()
async def sync_records(ctx: Context) -> str:
    # Send structured log through execution context
    ctx.info("Starting synchronization batch...")
    ctx.warning("Rate limit approaching 85% capacity.")
    return "Synced 100 records."
```

---

## ⏳ 2. Progress Tracking (`notifications/progress`)

For long-running tools (large database migrations, multi-file searches, web scraping), servers can emit real-time progress percentages to display visual progress bars in the host UI.

### Protocol Flow
1. **Host initiates tool call** and supplies a `progressToken` inside the `_meta` parameter:
   ```json
   {
     "jsonrpc": "2.0",
     "id": 42,
     "method": "tools/call",
     "params": {
       "name": "scan_large_dataset",
       "arguments": { "datasetId": "ds_901" },
       "_meta": {
         "progressToken": "token-xyz-123"
       }
     }
   }
   ```
2. **Server periodically emits progress notifications**:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "notifications/progress",
     "params": {
       "progressToken": "token-xyz-123",
       "progress": 45,
       "total": 100
     }
   }
   ```
3. **Server returns final result** via standard JSON-RPC response `id: 42`.

### Implementation Example (Python FastMCP)
```python
@mcp.tool()
async def process_large_file(total_chunks: int, ctx: Context) -> str:
    for i in range(1, total_chunks + 1):
        # Do chunk work
        await ctx.report_progress(progress=i, total=total_chunks)
    return f"Processed {total_chunks} chunks successfully."
```

---

## 🛑 3. Request Cancellation (`notifications/cancelled`)

When a user clicks "Stop Generating" or closes the active chat session in an MCP host, any in-flight tool execution should be immediately terminated to conserve CPU, memory, and database connections.

### Protocol Message
The client sends a `notifications/cancelled` notification indicating the request ID to abort:
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/cancelled",
  "params": {
    "requestId": 42,
    "reason": "User cancelled the request."
  }
}
```

### Server Handling with `AbortSignal`
Production servers link the `requestId` to an `AbortController`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "cancellation-demo", version: "1.0.0" });

// Active request controllers map
const activeRequests = new Map<number | string, AbortController>();

// Listen to cancellation notifications
server.server.setNotificationHandler(
  // CancelledNotificationSchema
  async (notification) => {
    if (notification.method === "notifications/cancelled") {
      const { requestId } = notification.params as any;
      const controller = activeRequests.get(requestId);
      if (controller) {
        controller.abort();
        activeRequests.delete(requestId);
      }
    }
  }
);
```
