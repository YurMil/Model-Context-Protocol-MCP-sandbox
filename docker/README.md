# Dockerized MCP Server Environment

Run Model Context Protocol (MCP) servers inside isolated Docker containers, exposing them as remote **Streamable HTTP / SSE services** for local or cloud LLM clients.

---

## 🚀 Quick Start with Docker Compose

Spin up all containerized MCP services with a single command:

```bash
docker compose up -d
```

### Active Services:
| Service | Endpoint | Port | Description |
| :--- | :--- | :---: | :--- |
| **Weather & Currency** | `http://localhost:8000/sse` | `8000` | Open-Meteo & currency exchange tools |
| **JSONPlaceholder Mock** | `http://localhost:8001/sse` | `8001` | Mock REST API (users, posts, comments) |

Check container status and logs:
```bash
docker compose ps
docker compose logs -f
```

Stop services:
```bash
docker compose down
```

---

## 🧪 Testing with Headless CLI Runner

Verify containerized servers from your host terminal using our test runner:

```bash
# Test remote Weather & Currency server
node tools/mcp-cli-runner/dist/index.js --url http://localhost:8000/sse list-tools

# Test remote JSONPlaceholder mock server
node tools/mcp-cli-runner/dist/index.js --url http://localhost:8001/sse list-tools
```

---

## 🤖 LLM Client Configurations for Dockerized Servers

### 1. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "docker_weather": {
      "url": "http://localhost:8000/sse"
    },
    "docker_jsonplaceholder": {
      "url": "http://localhost:8001/sse"
    }
  }
}
```

### 2. Cursor IDE (`.cursor/mcp.json` or Settings > MCP)
```json
{
  "mcpServers": {
    "docker_weather": {
      "url": "http://localhost:8000/sse"
    }
  }
}
```

### 3. Cline / Roo Code (VS Code Extension)
```json
{
  "mcpServers": {
    "docker_weather": {
      "url": "http://localhost:8000/sse",
      "disabled": false
    }
  }
}
```
