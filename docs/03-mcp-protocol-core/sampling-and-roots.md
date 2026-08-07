# MCP Sampling & Filesystem Roots

Sampling and Roots are advanced MCP primitives that manage server-side agentic capabilities and workspace security boundaries.

---

## 🤖 Server-Initiated Sampling (`sampling/createMessage`)

Sampling allows an **MCP Server to request an LLM completion from the MCP Host**, enabling server-driven sub-agent loops without exposing LLM API keys directly to the server.

### Flow Sequence
1. MCP Server receives `tools/call` for a complex task (e.g. `refactor_code`).
2. Server needs AI analysis on sub-components.
3. Server sends `sampling/createMessage` request back to the MCP Host:
   ```json
   {
     "jsonrpc": "2.0",
     "id": 99,
     "method": "sampling/createMessage",
     "params": {
       "messages": [
         {
           "role": "user",
           "content": { "type": "text", "text": "Evaluate safety of this refactor logic..." }
         }
       ],
       "maxTokens": 500
     }
   }
   ```
4. Host passes prompt to user's connected LLM and returns response to MCP Server.

---

## 📁 Workspace Roots (`roots/list`)

Roots allow the MCP Host to communicate allowed workspace path boundaries to MCP Servers.

### Request (`roots/list`)
Sent by MCP Server to query allowed workspace paths:

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "roots/list"
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "roots": [
      {
        "uri": "file:///e:/My%20web%20projects/Model-Context-Protocol-MCP-sandbox",
        "name": "MCP Sandbox Workspace"
      }
    ]
  }
}
```

MCP Servers MUST restrict file access, directory scans, and execution strictly within these declared root paths.
