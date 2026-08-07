# MCP Host Architecture & Compatibility Matrix

Different host environments (Desktop apps, IDEs, CLI tools, custom web platforms) support different subsets of the MCP specification.

---

## 📊 Host Capability Comparison Matrix

| Host Application | `stdio` Transport | `SSE` Transport | Tools Primitive | Resources Primitive | Prompts Primitive | Sampling (`createMessage`) | Dynamic Tool Refresh |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Claude Desktop** | ✅ Full | ⚠️ Via Proxy | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **Cursor IDE** | ✅ Full | ❌ No | ✅ Full | ⚠️ Read-only | ❌ No | ❌ No | ✅ Full |
| **Antigravity (AGY)** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Partial | ✅ Full |
| **Continue.dev** | ✅ Full | ⚠️ Experimental | ✅ Full | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **MCP Inspector** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Mocked | ✅ Full |
| **Custom Node/Python Client** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

---

## 🔌 Transports Comparison

### Standard I/O (`stdio`)
- **Mechanism**: The host spawns the MCP server as a child process and communicates via standard input (`stdin`) and standard output (`stdout`).
- **Pros**: Zero-network configuration, isolated process execution, highly secure for local tools.
- **Cons**: Server and client must run on the same physical machine.

### Server-Sent Events (`SSE`)
- **Mechanism**: HTTP POST for client requests combined with an SSE stream for server events.
- **Pros**: Remote connectivity, cloud hosting, microservice deployment.
- **Cons**: Requires transport authentication (bearer tokens, OAuth2, reverse proxy).

---

## 🛠️ Recommended Setup by Environment

- **Desktop Development**: Use `stdio` with TypeScript (`npx tsx`) or Python (`uv run`).
- **Remote / SaaS Integration**: Deploy MCP servers as Docker containers exposing `SSE` behind an API Gateway with OAuth2 authentication.
- **Local Open-Source LLMs**: Connect Ollama/LM Studio to an MCP client host using `stdio`.
