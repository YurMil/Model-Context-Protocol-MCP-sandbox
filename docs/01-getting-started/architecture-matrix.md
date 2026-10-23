# MCP Host Architecture & Compatibility Matrix

Different host environments (Desktop apps, IDEs, extensions, CLI tools, custom web platforms) support different subsets of the MCP specification.

---

## 📊 Host Capability Comparison Matrix

| Host Application | `stdio` Transport | `SSE` / Streamable HTTP | Tools Primitive | Resources Primitive | Prompts Primitive | Sampling (`createMessage`) | Dynamic Tool Refresh |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Claude Desktop** | ✅ Full | ✅ Full (with Headers) | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **Cursor IDE** | ✅ Full | ✅ Full (SSE & HTTP) | ✅ Full | ⚠️ Read-only | ❌ No | ❌ No | ✅ Full |
| **Windsurf (Codeium)** | ✅ Full | ⚠️ Experimental | ✅ Full | ⚠️ Partial | ❌ No | ❌ No | ✅ Full |
| **Cline (VS Code)** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **Roo Code (VS Code)** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **Zed Editor** | ✅ Full | ❌ No | ✅ Full | ⚠️ Partial | ❌ No | ❌ No | ✅ Full |
| **Antigravity (AGY)** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Partial | ✅ Full |
| **Continue.dev** | ✅ Full | ⚠️ Experimental | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **MCP Inspector** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Mocked | ✅ Full |
| **Custom Node/Python Client** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

---

## 🔌 Transports Detail: `stdio` vs Streamable HTTP

### 1. Standard I/O (`stdio`)
- **Mechanism**: The host spawns the MCP server as a local child process and exchanges JSON-RPC messages via standard input (`stdin`) and standard output (`stdout`).
- **Ideal For**: Local CLI tools, database connectors, local filesystem access, developer desktop environments.
- **Security**: Bound to host OS user permissions.

### 2. Streamable HTTP / Server-Sent Events (SSE)
- **Mechanism**:
  - **Streamable HTTP (Modern standard)**: Client sends JSON-RPC requests via HTTP POST to a single endpoint; server returns chunked streamable responses or SSE events.
  - **Legacy SSE**: Client opens an SSE connection (`GET /sse`) to receive server notifications and posts requests to an endpoint provided by the server.
- **Ideal For**: Microservices, remote team servers, Docker containers, cloud-hosted MCP services.
- **Security**: Uses HTTP headers (`Authorization: Bearer <token>`) and TLS encryption.

---

## 🛠️ Recommended Setup by Environment

- **Local IDE Agent (Cursor, Windsurf, Cline)**: Use `stdio` with TypeScript (`npx -y tsx ...`) or Python (`uv run ...`).
- **Team-Shared or Cloud Database Tools**: Deploy as a containerized Streamable HTTP server behind an API Gateway with Bearer token authentication.
- **Offline / Local Models (Ollama, LM Studio)**: Connect Ollama or LM Studio to Cline or Continue.dev using local `stdio` MCP servers.
