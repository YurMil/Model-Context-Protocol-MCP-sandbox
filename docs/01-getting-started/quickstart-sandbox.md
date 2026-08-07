# Quickstart: Setting Up the MCP Testing Sandbox

This guide walks you through launching a local sandbox environment to run, inspect, and verify MCP tools and resources before connecting them to production LLMs.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher (optional, for Python MCP servers)
- **uv**: Fast Python package installer (`pip install uv` or `winget install astral-sh.uv`)

---

## 🛠️ Step 1: Launch the Official MCP Inspector

The `@modelcontextprotocol/inspector` is a standalone developer tool for testing MCP servers.

Run an official demo server using `npx`:

```bash
npx @modelcontextprotocol/inspector npx -y @modelcontextprotocol/server-everything
```

Terminal Output:
```text
MCP Inspector is up and running at http://localhost:5173
TCP proxy listening on port 3000
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Step 2: Test Server Features in Inspector

1. **Inspect Tools**: Click on the **Tools** tab. Select `echo` or `add`. Provide JSON arguments and click **Run Tool**.
2. **Inspect Resources**: Click on the **Resources** tab. Select `test://static/resource/1` and click **Read Resource**.
3. **Inspect Prompts**: Click on the **Prompts** tab to inspect prompt templates and generate formatted messages.
4. **View Protocol Logs**: Toggle the **Notifications / Logs** panel at the bottom to view raw JSON-RPC 2.0 messages:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "message": "Hello MCP Sandbox"
    }
  }
}
```

---

## 📁 Step 3: Local Repository Directory Structure

When creating custom MCP servers in this sandbox repository, use the following layout:

```text
Model-Context-Protocol-MCP-sandbox/
├── docs/                      # Comprehensive documentation
├── servers/                   # Custom MCP Server projects
│   ├── ts-sqlite-server/      # Node.js/TS MCP server project
│   └── py-fetch-server/       # Python MCP server project
├── client-configs/            # Client configuration files
└── tests/                     # Automated test suites
```

---

## 🚀 Next Steps

- Learn how to integrate LLMs: [`docs/02-llm-providers/provider-architecture.md`](../02-llm-providers/provider-architecture.md)
- Configure local models (Ollama/LM Studio): [`docs/02-llm-providers/local-models.md`](../02-llm-providers/local-models.md)
