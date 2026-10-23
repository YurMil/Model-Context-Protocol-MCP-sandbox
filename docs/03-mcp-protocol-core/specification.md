# MCP Protocol Specification & Transports

The Model Context Protocol (MCP) uses **JSON-RPC 2.0** as its base messaging format. Messages are exchanged between MCP Client Hosts and MCP Servers over defined transport layers.

---

## ✉️ JSON-RPC 2.0 Message Structure

### 1. Request Message
Sent by client or server requiring a response.

```json
{
  "jsonrpc": "2.0",
  "id": 101,
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": { "expression": "40 + 2" }
  }
}
```

### 2. Response Message (Success)
Returned by receiver upon successful processing.

```json
{
  "jsonrpc": "2.0",
  "id": 101,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "42"
      }
    ]
  }
}
```

### 3. Response Message (Error)
Returned when an error occurs during execution.

```json
{
  "jsonrpc": "2.0",
  "id": 101,
  "error": {
    "code": -32602,
    "message": "Invalid params: Missing required field 'expression'"
  }
}
```

### 4. Notification Message
One-way message that does not expect a response (`id` is omitted).

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/tools/list_changed"
}
```

---

## 🔌 Transports Detail

### Standard I/O (`stdio`)
- Messages are formatted as UTF-8 encoded JSON strings terminated by a newline (`\n`).
- Standard error (`stderr`) is strictly reserved for server logging/diagnostics (ignored by JSON-RPC parser).

### Streamable HTTP & Server-Sent Events (`SSE`)
- **Streamable HTTP (Modern Standard)**: Single-endpoint HTTP POST (`/mcp`) supporting chunked streaming and SSE responses, stateful session identifiers (`Mcp-Session-Id`), and Bearer authentication headers. See [`streamable-http.md`](streamable-http.md).
- **Legacy SSE**: Client establishes HTTP GET connection to `/sse`. Server responds with an endpoint URI for POST requests (`/message?sessionId=...`).

---

## 🧭 Advanced Protocol Primitives

- **Structured Logging (`logging/message`)**: Structured RFC-5424 severity logs without polluting standard input/output.
- **Progress Tracking (`notifications/progress`)**: Real-time progress percentage notifications for long-running operations.
- **Request Cancellation (`notifications/cancelled`)**: Immediate cancellation of in-flight execution when a user halts the generation.

See full documentation in [`logging-and-notifications.md`](logging-and-notifications.md).
