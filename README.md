# Model Context Protocol (MCP) Sandbox & Documentation Hub

[![CI](https://github.com/YurMil/Model-Context-Protocol-MCP-sandbox/actions/workflows/ci.yml/badge.svg)](https://github.com/YurMil/Model-Context-Protocol-MCP-sandbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Spec](https://img.shields.io/badge/MCP-Specification-orange.svg)](https://modelcontextprotocol.io)

Welcome to the **Model Context Protocol (MCP) Sandbox & Documentation Hub**. This repository serves as a comprehensive, production-grade reference architecture, testing playground, and integration guide for connecting Large Language Models (LLMs)—both local open-weights and cloud APIs—to external services, databases, and APIs using the Model Context Protocol (MCP).

---

## 📌 What is Model Context Protocol (MCP)?

The **Model Context Protocol (MCP)** is an open specification designed by Anthropic that standardizes how applications provide context and tools to Large Language Models. MCP establishes a universal client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     MCP Host                            │
│  (Claude Desktop, Cursor, AGY, Custom LLM Harness)     │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                   MCP Client                    │   │
│   └────────────────────────┬────────────────────────┘   │
└────────────────────────────┼────────────────────────────┘
                             │  JSON-RPC 2.0
                             │  Transports: stdio / SSE / WS
┌────────────────────────────┴────────────────────────────┐
│                    MCP Server                           │
│  (Database, Web API, DevOps Tools, Local File System)   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Documentation Sitemap

### 1. 🚀 Getting Started
- [`docs/01-getting-started/overview.md`](docs/01-getting-started/overview.md) — Core MCP concepts, client-server paradigm, and protocol lifecycle.
- [`docs/01-getting-started/architecture-matrix.md`](docs/01-getting-started/architecture-matrix.md) — Capability and compatibility matrix across major MCP hosts and clients.
- [`docs/01-getting-started/quickstart-sandbox.md`](docs/01-getting-started/quickstart-sandbox.md) — Step-by-step guide to setting up your local MCP testing environment.

### 2. 🧠 LLM Provider Integration
- [`docs/02-llm-providers/provider-architecture.md`](docs/02-llm-providers/provider-architecture.md) — Architectural patterns for connecting LLMs to MCP tool definitions.
- [`docs/02-llm-providers/model-scale-and-multimodal-mcp.md`](docs/02-llm-providers/model-scale-and-multimodal-mcp.md) — Impact of model size (1B edge to 200B+ reasoning) and multimodality (vision, screenshots, audio) on MCP design.
- [`docs/02-llm-providers/local-models.md`](docs/02-llm-providers/local-models.md) — Running MCP with local models via Ollama, LM Studio, vLLM, and Llama.cpp.
- [`docs/02-llm-providers/cloud-api-models.md`](docs/02-llm-providers/cloud-api-models.md) — Integration with cloud APIs (OpenAI, Anthropic Claude, Google Gemini, Groq, Mistral).
- [`docs/02-llm-providers/subscription-proxies.md`](docs/02-llm-providers/subscription-proxies.md) — Working with API proxies, OpenRouter, LiteLLM gateways, and key rotation.

### 3. ⚙️ MCP Core Specification & Primitives
- [`docs/03-mcp-protocol-core/specification.md`](docs/03-mcp-protocol-core/specification.md) — JSON-RPC 2.0 transport layers (`stdio`, `SSE`, WebSockets) and lifecycle messages.
- [`docs/03-mcp-protocol-core/streamable-http.md`](docs/03-mcp-protocol-core/streamable-http.md) — Streamable HTTP transport, remote proxying, and session state.
- [`docs/03-mcp-protocol-core/tools-primitives.md`](docs/03-mcp-protocol-core/tools-primitives.md) — Defining executable Tools, schema validation, and tool annotations.
- [`docs/03-mcp-protocol-core/resources-primitives.md`](docs/03-mcp-protocol-core/resources-primitives.md) — Exposing Resources, custom URI schemes (`file://`, `db://`), and dynamic templates.
- [`docs/03-mcp-protocol-core/prompts-primitives.md`](docs/03-mcp-protocol-core/prompts-primitives.md) — Exposing Prompts and re-usable context templates to LLM applications.
- [`docs/03-mcp-protocol-core/sampling-and-roots.md`](docs/03-mcp-protocol-core/sampling-and-roots.md) — Server-initiated LLM sampling (`mcp/createMessage`) and filesystem security roots.
- [`docs/03-mcp-protocol-core/logging-and-notifications.md`](docs/03-mcp-protocol-core/logging-and-notifications.md) — Structured logging, progress tracking, and request cancellation.

### 4. 🔌 Service Integrations
- [`docs/04-service-integrations/database-connectors.md`](docs/04-service-integrations/database-connectors.md) — Building MCP servers for PostgreSQL, Neon, Supabase, SQLite, and Redis.
- [`docs/04-service-integrations/web-and-apis.md`](docs/04-service-integrations/web-and-apis.md) — Connecting REST, GraphQL, browser automation (Playwright), and web scrapers.
- [`docs/04-service-integrations/devops-and-cloud.md`](docs/04-service-integrations/devops-and-cloud.md) — MCP integrations for Docker, Kubernetes, Git, and Cloud Providers (AWS/GCP/Azure).
- [`docs/04-service-integrations/enterprise-auth.md`](docs/04-service-integrations/enterprise-auth.md) — Authentication patterns: OAuth2, API key vaults, environment sanitation, and RBAC.

### 5. 🧪 Testing & Sandbox Tools
- [`tools/mcp-cli-runner/`](tools/mcp-cli-runner/README.md) — Standalone Headless CLI testing tool for inspecting and invoking MCP servers directly in terminal.
- [`docs/05-testing-and-sandbox/mcp-inspector-guide.md`](docs/05-testing-and-sandbox/mcp-inspector-guide.md) — Debugging MCP servers using `@modelcontextprotocol/inspector`.
- [`docs/05-testing-and-sandbox/test-harness-and-mocking.md`](docs/05-testing-and-sandbox/test-harness-and-mocking.md) — Unit and integration test suites for TypeScript (Vitest) and Python (pytest).
- [`docs/05-testing-and-sandbox/benchmarking-evals.md`](docs/05-testing-and-sandbox/benchmarking-evals.md) — Evaluating tool accuracy across small local models vs large cloud models.

### 6. 🛡️ Security & Best Practices
- [`docs/06-security-and-best-practices/security-guidelines.md`](docs/06-security-and-best-practices/security-guidelines.md) — Hardening MCP against prompt injection, directory traversal, and unauthorized tool calls.
- [`docs/06-security-and-best-practices/error-handling-resilience.md`](docs/06-security-and-best-practices/error-handling-resilience.md) — Standardized JSON-RPC errors, rate limiting, and exponential backoff retry rules.

### 7. 📄 Templates & Configuration Reference
- [`docs/07-templates-and-examples/mcp-server-ts-template.md`](docs/07-templates-and-examples/mcp-server-ts-template.md) — Complete TypeScript MCP Server boilerplate using `@modelcontextprotocol/sdk`.
- [`docs/07-templates-and-examples/mcp-server-python-template.md`](docs/07-templates-and-examples/mcp-server-python-template.md) — Complete Python MCP Server boilerplate using FastMCP / official SDK.
- [`docs/07-templates-and-examples/client-config-examples.md`](docs/07-templates-and-examples/client-config-examples.md) — Production client configurations (`claude_desktop_config.json`, Cursor, AGY, LiteLLM).

### 8. 💻 Open-Source Executable Examples (`examples/`)
- [`examples/01-sqlite-notes-server/`](examples/01-sqlite-notes-server/README.md) — TypeScript: Local SQLite database server for storing and searching notes (`notes.db`).
- [`examples/02-python-weather-currency-server/`](examples/02-python-weather-currency-server/README.md) — Python FastMCP: Weather forecast & currency conversion using free public APIs (Open-Meteo & Open Exchange Rates).
- [`examples/03-filesystem-sandbox-server/`](examples/03-filesystem-sandbox-server/README.md) — TypeScript: Scoped local file explorer with strict root path validation.
- [`examples/04-json-rest-api-mock-server/`](examples/04-json-rest-api-mock-server/README.md) — Python FastMCP: Wrapper for JSONPlaceholder public REST API (users, posts, comments).

### 9. 🐳 Docker & Containerization (`docker/`)
- [`docker/`](docker/README.md) — Multi-container Docker Compose setup for launching remote MCP servers over Streamable HTTP / SSE.

---

## ⚡ Quick Start: Testing Your First MCP Server

1. **Test with Headless CLI Runner**:
   ```bash
   cd tools/mcp-cli-runner && npm install && npm run build
   node dist/index.js --command node --args "../../examples/01-sqlite-notes-server/dist/index.js" list-tools
   ```
2. **Launch with Docker Compose**:
   ```bash
   docker compose up -d
   ```
3. **Inspect with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector npx -y @modelcontextprotocol/server-everything
   ```

---

## 🌐 Quick Matrix: Local vs Cloud LLMs with MCP

| Provider Type | Recommended Models | Function Calling Support | Context Limit Strategy | Ideal MCP Transport |
| :--- | :--- | :--- | :--- | :--- |
| **Local LLMs** | Qwen 2.5 Coder (14B/32B), Llama 3.3 70B, DeepSeek-R1 | Excellent (via Ollama API & native tool choice) | 16K+ context (`num_ctx`), concise schemas | `stdio` |
| **Cloud APIs** | Claude 3.7 Sonnet, Gemini 2.0 Flash, OpenAI o3-mini/GPT-4o | Outstanding (parallel execution & reasoning) | Full rich JSON Schemas | `stdio` / Streamable HTTP |
| **Proxies / Gateways** | LiteLLM Proxy, OpenRouter, Custom Gateway | Provider-dependent | Routing rules & model fallback | Streamable HTTP / SSE |

---

## 📄 License & Attribution

This repository is maintained as an open reference architecture based on the official [Model Context Protocol Specification](https://modelcontextprotocol.io).
