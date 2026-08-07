# Example 03: Safe Filesystem Sandbox MCP Server (TypeScript)

A TypeScript MCP server that exposes tools for inspecting directories, reading text files, and searching keywords strictly scoped inside a designated sandbox folder boundary.

---

## 📌 Features Exposed to LLMs

### Tools
- `list_directory({"relativePath": "."})` — Lists files and subdirectories inside the sandbox.
- `read_file({"relativePath": "example.txt"})` — Reads text file content safely.
- `search_files_by_keyword({"keyword": "function"})` — Scans files in sandbox for keyword occurrences.

### Security
- Enforces strict root path boundary validation (`path.resolve()`). Rejects any attempts to access files outside the declared root path using `../` path traversal.

---

## 🚀 How to Run & Build

### 1. Install & Build
```bash
cd examples/03-filesystem-sandbox-server
npm install
npm run build
```

### 2. Inspect using MCP Inspector
```bash
npm run inspect
```
Open `http://localhost:5173`.
