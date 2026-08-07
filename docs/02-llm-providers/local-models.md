# Local LLM Integration (Ollama, LM Studio, vLLM)

Using open-weights local models (e.g. Llama 3.1, Qwen 2.5, Mistral, DeepSeek-R1) with MCP allows you to run completely offline, zero-telemetry tool workflows.

---

## 🛠️ Supported Local Runtimes

| Runtime Engine | Native Tool Calling | OpenAI API Emulation | MCP Client Integration | Best Models for MCP |
| :--- | :---: | :---: | :--- | :--- |
| **Ollama** | ✅ Yes (`v0.3+`) | ✅ `http://localhost:11434/v1` | Ollama-MCP / Continue / AGY | `llama3.1:8b-instruct`, `qwen2.5:7b`, `mistral:7b` |
| **LM Studio** | ✅ Yes (`v0.3+`) | ✅ `http://localhost:1234/v1` | LM Studio MCP Bridge | `Qwen2.5-Coder-14B-Instruct`, `Hermes-3-Llama-3.1-8B` |
| **vLLM** | ✅ Yes | ✅ `http://localhost:8000/v1` | LiteLLM Gateway / LangChain | `meta-llama/Llama-3.1-8B-Instruct`, `Qwen/Qwen2.5-14B-Instruct` |
| **Llama.cpp** | ⚠️ Partial | ✅ `http://localhost:8080/v1` | Custom Harness | GGUF quantizations (`Q4_K_M`, `Q8_0`) |

---

## 🚀 Setting Up MCP with Ollama

### Step 1: Pull Tool-Capable Models
Ensure you are using a model fine-tuned for tool use:

```bash
ollama pull llama3.1:8b-instruct-q4_K_M
ollama pull qwen2.5:7b-instruct
```

### Step 2: Use Ollama as an OpenAI-compatible Gateway

Many MCP hosts (like Continue.dev, Custom LangChain/LlamaIndex agents, or LiteLLM) connect to Ollama via its OpenAI endpoint:

```text
Base URL: http://localhost:11434/v1
API Key: ollama (placeholder)
Model: llama3.1:8b-instruct-q4_K_M
```

---

## 💡 Best Practices for Local MCP Execution

> [!TIP]
> **Keep Tool Schemas Compact**
> Small models (7B - 14B parameters) perform best when tool parameters are limited to basic types (`string`, `number`, `boolean`, `array of strings`). Avoid deeply nested JSON objects.

> [!WARNING]
> **Context Window Sizing**
> Default Ollama context window size is often set to `2048` tokens. MCP tool definitions can easily consume 1,000+ tokens. Always increase the context window size in your request or model config:
> ```json
> {
>   "options": {
>     "num_ctx": 8192
>   }
> }
> ```

---

## 🧪 Local MCP Integration Example (Python script with Ollama + FastMCP)

```python
# scratch/local_ollama_mcp.py
import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"

# Example sending MCP tool definition to Ollama
def query_ollama_with_mcp_tools(prompt, mcp_tools):
    payload = {
        "model": "qwen2.5:7b",
        "messages": [{"role": "user", "content": prompt}],
        "tools": mcp_tools,
        "stream": False,
        "options": {"num_ctx": 8192}
    }
    response = requests.post(OLLAMA_URL, json=payload)
    return response.json()
```
