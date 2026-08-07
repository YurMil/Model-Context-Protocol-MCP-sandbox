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

### Server-Sent Events (`SSE`)
- **Initialization**: Client establishes HTTP GET connection to `/sse`. Server responds with an SSE event containing an endpoint URI for POST requests:
  ```http
  event: endpoint
  data: /message?sessionId=abc-123
  ```
- **Client Requests**: Sent via HTTP POST to `/message?sessionId=abc-123`.
- **Server Notifications/Responses**: Sent down the established SSE stream.
