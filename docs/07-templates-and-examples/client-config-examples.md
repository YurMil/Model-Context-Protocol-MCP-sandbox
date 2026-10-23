# Client Configuration Examples & Snippets

Copy-paste configuration templates for connecting your MCP servers to popular MCP Host applications.

---

## 🖥️ Claude Desktop

- **Windows Path**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS Path**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sqlite_notes": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
      ]
    },
    "python_weather": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/02-python-weather-currency-server",
        "server.py"
      ]
    },
    "remote_team_server": {
      "url": "https://mcp.internal.company.com/sse",
      "headers": {
        "Authorization": "Bearer sec_token_abc123"
      }
    }
  }
}
```

---

## 💻 Cursor IDE

Configure via **Cursor Settings > Features > MCP**, or create `.cursor/mcp.json` in your workspace root:

```json
{
  "mcpServers": {
    "sqlite_notes": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
      ]
    },
    "remote_api_service": {
      "url": "https://mcp-gateway.example.com/sse",
      "headers": {
        "Authorization": "Bearer secret-token"
      }
    }
  }
}
```

---

## 🌊 Windsurf (Codeium)

- **Config Path**: `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "sqlite_notes": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
      ]
    },
    "filesystem_sandbox": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/03-filesystem-sandbox-server/dist/index.js"
      ],
      "env": {
        "SANDBOX_ROOT": "E:/My web projects/Model-Context-Protocol-MCP-sandbox"
      }
    }
  }
}
```

---

## 🤖 Cline & Roo Code (VS Code Extension)

- **Config Path**: Open Cline extension settings -> **MCP Servers** tab (edits `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "sqlite_notes": {
      "command": "node",
      "args": [
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
      ],
      "disabled": false,
      "autoApprove": [
        "list_all_notes",
        "search_notes"
      ]
    },
    "weather_currency": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/02-python-weather-currency-server",
        "server.py"
      ],
      "disabled": false
    }
  }
}
```

---

## ⚡ Zed Editor

- **Config Path**: `~/.config/zed/settings.json` (or `%APPDATA%\Zed\settings.json` on Windows):

```json
{
  "context_servers": {
    "sqlite-notes": {
      "command": {
        "path": "node",
        "args": [
          "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
        ]
      }
    }
  }
}
```

---

## 🚀 Antigravity / Gemini CLI

```json
{
  "mcp": {
    "servers": {
      "notes_server": {
        "command": "node",
        "args": [
          "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/01-sqlite-notes-server/dist/index.js"
        ]
      }
    }
  }
}
```

---

## 🔀 LiteLLM OpenAI Proxy with Ollama & MCP

```yaml
# litellm_config.yaml
model_list:
  - model_name: qwen-coder
    litellm_params:
      model: ollama/qwen2.5-coder:14b
      api_base: http://localhost:11434
      num_ctx: 16384
  - model_name: llama-3.3
    litellm_params:
      model: ollama/llama3.3:70b
      api_base: http://localhost:11434
      num_ctx: 16384

router_settings:
  routing_strategy: usage-based-routing-v2
  timeout: 60
```

Start the proxy:
```bash
litellm --config litellm_config.yaml --port 4000
```
