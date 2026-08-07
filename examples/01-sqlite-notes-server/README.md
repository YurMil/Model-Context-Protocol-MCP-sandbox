# Example 01: SQLite Notes & Tags MCP Server (TypeScript)

A complete, self-contained TypeScript MCP server that manages a local SQLite database for storing, tagging, and searching notes.

---

## 📌 Features Exposed to LLMs

### Tools
- `create_note({"title": "...", "content": "...", "tags": ["tag1", "tag2"]})` — Creates a new note.
- `search_notes({"query": "..."})` — Searches notes by title, content, or tag.
- `list_all_notes({})` — Lists all stored notes.
- `delete_note({"id": 1})` — Deletes a note by ID.

### Resources
- `sqlite://notes/schema` — Exposes SQLite table schemas (`notes`, `tags`) to the LLM context.

---

## 🚀 How to Run & Build

### 1. Install Dependencies
```bash
cd examples/01-sqlite-notes-server
npm install
```

### 2. Build the TypeScript Source
```bash
npm run build
```

### 3. Test with MCP Inspector
```bash
npm run inspect
```
Open `http://localhost:5173` to test the tools.

---

## 🤖 LLM Client Setup

### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "sqlite_notes": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
      ]
    }
  }
}
```

### Local LLM (Ollama via LiteLLM) Setup
1. Pull Ollama model: `ollama pull llama3.1:8b-instruct`
2. Configure `client-configs/ollama_litellm_config.yaml`
3. Launch LiteLLM: `litellm --config client-configs/ollama_litellm_config.yaml --port 4000`
