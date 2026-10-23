# MCP Headless CLI Test Runner

A lightweight, standalone command-line testing utility for the Model Context Protocol (MCP). It allows developers and QA teams to inspect and invoke tools, resources, and prompts from any MCP server directly in the terminal—without launching a web browser or desktop LLM client.

---

## 🚀 Installation & Setup

```bash
cd tools/mcp-cli-runner
npm install
npm run build
```

---

## 🛠️ Usage Examples

### 1. List Available Tools (`list-tools`)
Connect to any local `stdio` server:
```bash
# Using npx tsx directly
npx tsx src/index.ts --command node --args ../../examples/01-sqlite-notes-server/dist/index.js list-tools

# Or using compiled build
node dist/index.js --command node --args ../../examples/01-sqlite-notes-server/dist/index.js list-tools
```

### 2. Invoke a Specific Tool (`call-tool`)
Pass tool arguments as a JSON string:
```bash
npx tsx src/index.ts --command node --args ../../examples/01-sqlite-notes-server/dist/index.js call-tool create_note '{"title": "CLI Test Note", "content": "Testing MCP from terminal", "tags": "cli,testing"}'
```

Search notes:
```bash
npx tsx src/index.ts --command node --args ../../examples/01-sqlite-notes-server/dist/index.js call-tool search_notes '{"query": "CLI"}'
```

### 3. Read Database / File Resources (`read-resource`)
```bash
npx tsx src/index.ts --command node --args ../../examples/01-sqlite-notes-server/dist/index.js read-resource sqlite://notes/schema
```

### 4. Connect to Remote SSE / Streamable HTTP Server
```bash
npx tsx src/index.ts --url http://localhost:8000/sse list-tools
```

---

## 📋 Command Reference

```text
Options:
  -c, --command <cmd>       Executable command (for stdio, e.g. 'node', 'uv')
  -a, --args <args...>      Arguments passed to command
  -u, --url <url>           Remote SSE URL (e.g. 'http://localhost:8000/sse')
  -e, --env <env...>        Environment variables as KEY=VALUE pairs
  -V, --version             Output version number
  -h, --help                Display help for command

Commands:
  list-tools                List all tools exposed by the server
  call-tool <name> [args]   Execute tool with JSON arguments
  list-resources            List all resources exposed by the server
  read-resource <uri>       Read contents of a specific resource URI
  list-prompts              List all prompt templates exposed by the server
```
