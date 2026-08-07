# Client Configuration Examples & Snippets

Copy-paste configuration templates for connecting your MCP servers to popular MCP Host applications.

---

## 🖥️ Claude Desktop Config (`claude_desktop_config.json`)

- **Windows Path**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS Path**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sqlite_sandbox": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/sandbox.db"
      ]
    },
    "custom_ts_server": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/servers/ts-sqlite-server/dist/index.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb",
        "NODE_ENV": "development"
      }
    },
    "python_fastmcp_server": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/servers/py-fetch-server",
        "server.py"
      ]
    },
    "remote_sse_server": {
      "url": "https://mcp.mycompany.com/sse",
      "headers": {
        "Authorization": "Bearer my_secret_token_123"
      }
    }
  }
}
```

---

## 💻 Cursor IDE MCP Config (`.cursor/mcp.json` or Settings > MCP)

```json
{
  "mcpServers": {
    "dev_tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

---

## 🚀 Antigravity / Gemini CLI / Custom Host Config

```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "E:/My web projects/Model-Context-Protocol-MCP-sandbox"
        ]
      }
    }
  }
}
```

---

## 🔀 LiteLLM OpenAI Proxy Integration with Local Ollama

```yaml
# litellm_config.yaml
model_list:
  - model_name: local-mcp-model
    litellm_params:
      model: ollama/llama3.1:8b-instruct
      api_base: http://localhost:11434
      num_ctx: 8192
```

Launch:
```bash
litellm --config litellm_config.yaml --port 4000
```
