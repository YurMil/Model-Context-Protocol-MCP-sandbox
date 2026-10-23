# MCP Protocol: Streamable HTTP & Remote Transport

While standard input/output (`stdio`) is the preferred choice for local desktop environments, **Streamable HTTP** is the official standard for deploying remote, containerized, and multi-tenant MCP microservices.

---

## 🌐 The Evolution: Streamable HTTP vs Legacy SSE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STREAMABLE HTTP EVOLUTION                             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ⚠️ Legacy Two-Endpoint SSE           │ 🚀 Modern Streamable HTTP            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • GET /sse for server events         │ • Single unified endpoint (POST /mcp)│
│ • POST /message?sessionId=... for req│ • Chunked Transfer or SSE streaming  │
│ • Prone to proxy connection drops    │ • Stateless or Stateful sessions     │
│ • Awkward header & cookie delegation │ • Standard HTTP auth (Bearer tokens) │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 🔄 Protocol Flow & Handshake

### 1. Unified Endpoint (`POST /mcp`)
The client sends standard JSON-RPC 2.0 payloads via HTTP POST. 
- If the response is instantaneous, the server returns standard `application/json`.
- If the operation generates streams, notifications, or partial completions, the server streams the response using `text/event-stream` or chunked HTTP streaming.

```http
POST /mcp HTTP/1.1
Host: mcp-api.company.com
Content-Type: application/json
Authorization: Bearer secret_access_token_123
Mcp-Session-Id: sess_9876543210

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query_analytics",
    "arguments": { "metric": "active_users" }
  }
}
```

### 2. Session Management (`Mcp-Session-Id`)
To maintain stateful context (such as open database transactions, working directories, or tool subscriptions), the server issues a session identifier in response headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Mcp-Session-Id: sess_9876543210

{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { ... }
}
```

Subsequent requests from the client include `Mcp-Session-Id: sess_9876543210`. If a connection drops, the client reconnects and resumes the session without re-executing initialization handshakes.

---

## 🔒 Enterprise Production Architecture

For remote corporate deployments, MCP servers should sit behind a secure reverse proxy:

```
┌─────────────────┐       HTTPS / Bearer Auth       ┌─────────────────────┐
│   MCP Client    ├────────────────────────────────►│   Reverse Proxy     │
│ (Claude/Cursor) │                                 │  (Nginx / Traefik)  │
└─────────────────┘                                 └──────────┬──────────┘
                                                               │ Terminate TLS
                                                               │ Rate Limit & RBAC
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │ MCP Server Pod /    │
                                                    │ Docker Container    │
                                                    └─────────────────────┘
```

### Example Nginx Configuration for Streamable HTTP
```nginx
location /mcp {
    proxy_pass http://localhost:8080/mcp;
    proxy_http_version 1.1;

    # Enable streaming (disable proxy buffering for instant chunk delivery)
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    chunked_transfer_encoding on;

    # Forward auth headers
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Mcp-Session-Id $http_mcp_session_id;

    # Timeouts for long-running LLM tools
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
}
```

---

## 🐍 Python Remote Server Example (FastMCP with SSE / HTTP)

FastMCP supports serving over HTTP natively:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("RemoteService")

@mcp.tool()
def get_service_status() -> str:
    return "All microservices operating normally."

if __name__ == "__main__":
    # Launch with SSE / HTTP transport on port 8000
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
```
Client connects via: `http://localhost:8000/sse`.
