# MCP Overview & Architecture

## Core Concept

The **Model Context Protocol (MCP)** is an open standard designed to eliminate the fragmentation of integrating LLMs with diverse data sources, tools, and environments.

Instead of writing custom API integrations for every LLM application (e.g., custom code for Claude, custom plugins for ChatGPT, custom extensions for Cursor), MCP provides a **single standard interface**:

- **MCP Hosts**: Client applications (e.g., Claude Desktop, Cursor, AGY, Custom LLM applications) that initiate connections and orchestrate model interactions.
- **MCP Servers**: Lightweight services that expose capabilities (Tools, Resources, Prompts) via standard JSON-RPC 2.0.
- **LLM Engine**: The generative AI model (local or cloud) that interprets user requests and generates tool invocation calls.

---

## 🏗️ Protocol Architecture & Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 MCP HOST                                    │
│                                                                             │
│  ┌────────────────────────┐                   ┌──────────────────────────┐  │
│  │   LLM Application UI   │                   │    MCP Client Manager    │  │
│  └───────────┬────────────┘                   └────────────┬─────────────┘  │
│              │                                             │                │
└──────────────┼─────────────────────────────────────────────┼────────────────┘
               │ Query                                       │ JSON-RPC
               ▼                                             ▼
 ┌──────────────────────────┐                  ┌────────────────────────────┐
 │  LLM Provider (Cloud/    │                  │       Transport Layer      │
 │  Local API Endpoint)     │                  │    (Stdio / SSE / HTTP)     │
 └──────────────────────────┘                  └─────────────┬──────────────┘
                                                             │
                                                             ▼
                                               ┌────────────────────────────┐
                                               │         MCP SERVER         │
                                               │ ┌────────────────────────┐ │
                                               │ │ Tools (API Execution)  │ │
                                               │ │ Resources (Context)    │ │
                                               │ │ Prompts (Templates)    │ │
                                               │ └────────────────────────┘ │
                                               └────────────────────────────┘
```

---

## 🧩 Key Primitives

| Primitive | Direction | Description | Example Use Case |
| :--- | :--- | :--- | :--- |
| **Tools** | Host ➔ Server | Executable functions called by the LLM with arguments. | Execute SQL query, post Slack message, create file. |
| **Resources** | Host ➔ Server | Passive context or data documents attached to prompt context. | Read log file, fetch database schema, inspect file tree. |
| **Prompts** | Server ➔ Host | Parameterized prompt templates provided by the server. | "Analyze code repository", "Generate DB migration". |
| **Sampling** | Server ➔ Host | Request where the server asks the host's LLM to generate completions. | Agentic loops inside MCP server. |
| **Roots** | Host ➔ Server | Security boundaries defining allowed filesystem paths. | Restricting file server access to workspace folder. |

---

## 🔄 Protocol Lifecycle

1. **Initialization Handshake**:
   - Client opens transport (`stdio` process or `SSE` HTTP connection).
   - Client sends `initialize` request with client info and supported capabilities.
   - Server responds with server info and server capabilities (`tools`, `resources`, `prompts`).
   - Client sends `notifications/initialized` signal.

2. **Capability Discovery**:
   - Client requests `tools/list`, `resources/list`, or `prompts/list`.
   - Server returns schemas describing available tools and resources.

3. **Execution Phase**:
   - User issues prompt to host.
   - Host sends context + tool definitions to LLM.
   - LLM decides to call tool `query_database({"query": "SELECT * FROM users"})`.
   - Client sends `tools/call` JSON-RPC request to MCP Server.
   - MCP Server executes query and returns structured text/image content.
   - Host feeds result back to LLM for final natural language synthesis.

4. **Shutdown**:
   - Host closes transport connection; MCP server terminates or cleans up session.
