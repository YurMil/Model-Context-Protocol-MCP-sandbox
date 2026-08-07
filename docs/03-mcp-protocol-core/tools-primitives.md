# MCP Tools Primitive

Tools are executable functions exposed by an MCP Server that allow LLMs to take actions or fetch dynamic real-time data.

---

## 🛠️ Tool Registration & Declaration

Servers advertise available tools via `tools/list`. Each tool consists of:
- `name`: Unique alphanumeric identifier (e.g. `execute_query`, `read_file`).
- `description`: Human and LLM-readable description of what the tool does.
- `inputSchema`: JSON Schema object defining required and optional arguments.

```json
{
  "name": "search_documents",
  "description": "Searches internal knowledge base for relevant documents.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Keywords or question to search."
      },
      "limit": {
        "type": "integer",
        "default": 5,
        "description": "Maximum number of results to return."
      }
    },
    "required": ["query"]
  }
}
```

---

## 📤 Tool Invocation (`tools/call`)

When an LLM requests a tool call, the host sends `tools/call`:

```json
{
  "jsonrpc": "2.0",
  "id": 42,
  "method": "tools/call",
  "params": {
    "name": "search_documents",
    "arguments": {
      "query": "MCP protocol specifications",
      "limit": 3
    }
  }
}
```

---

## 📥 Tool Response Content Types

Tool results can return text, images, or embedded resources.

```json
{
  "jsonrpc": "2.0",
  "id": 42,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 2 documents matching your query..."
      },
      {
        "type": "image",
        "data": "base64EncodedPngData...",
        "mimeType": "image/png"
      }
    ],
    "isError": false
  }
}
```

If execution fails, set `isError: true` inside `result` so the LLM knows the tool failed without breaking protocol RPC syntax.
