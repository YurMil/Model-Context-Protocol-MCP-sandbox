# Testing & Sandbox: MCP Inspector Guide

The `@modelcontextprotocol/inspector` is an interactive browser UI and CLI tool designed specifically for testing, debugging, and benchmarking MCP servers without launching a full LLM desktop client.

---

## 🚀 Running Inspector with Local Servers

### 1. Node.js / TypeScript Server
```bash
npx @modelcontextprotocol/inspector npx -y tsx servers/ts-sqlite-server/src/index.ts
```

### 2. Python Server
```bash
npx @modelcontextprotocol/inspector uv run servers/py-fetch-server/main.py
```

---

## 🔍 Key Inspector Features

1. **Interactive Tool Tester**: Test tools with custom JSON inputs, inspect structured output, and toggle `isError` behavior.
2. **Resource Browser**: View exposed resources, test dynamic resource template substitutions, and monitor real-time update notifications.
3. **Prompt Playground**: Render system prompts with argument substitutions.
4. **JSON-RPC Wire Log**: View real-time request/response payloads, latency metrics, and error stack traces.

---

## 📸 Inspector Screenshot Workflow

```text
[Browser UI: http://localhost:5173]
 ├── Server Info (capabilities: tools, resources, prompts)
 ├── Tool Selector Dropdown [ echo | execute_sql ]
 ├── Input Form (Generated dynamically from JSON Schema)
 └── Response Output Panel (Text / Image / JSON)
```
