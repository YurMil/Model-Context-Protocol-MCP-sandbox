# Local LLM Integration (Ollama, LM Studio, vLLM, Llama.cpp)

Using open-weights local models with MCP allows you to run completely offline, zero-telemetry, and cost-free agentic workflows.

---

## 🛠️ Supported Local Runtimes & Model Recommendations

| Runtime Engine | Native Tool Calling | OpenAI API Emulation | MCP Client Integration | Best Models for MCP (Ranked) |
| :--- | :---: | :---: | :--- | :--- |
| **Ollama** | ✅ Yes (`v0.4+`) | ✅ `http://localhost:11434/v1` | Direct / Continue / Cline / AGY | 1. `qwen2.5-coder:14b` / `32b`<br>2. `llama3.3:70b`<br>3. `deepseek-r1:14b`<br>4. `llama3.1:8b-instruct` |
| **LM Studio** | ✅ Yes (`v0.3+`) | ✅ `http://localhost:1234/v1` | LM Studio MCP Bridge / Direct | `Qwen2.5-Coder-14B-Instruct-GGUF`, `Hermes-3-Llama-3.1-8B` |
| **vLLM** | ✅ Yes | ✅ `http://localhost:8000/v1` | LiteLLM Gateway / LangChain | `Qwen/Qwen2.5-Coder-32B-Instruct`, `meta-llama/Llama-3.3-70B-Instruct` |
| **Llama.cpp** | ✅ Via server grammar / tools | ✅ `http://localhost:8080/v1` | Custom Harness / OpenAI proxy | GGUF quantizations (`Q4_K_M`, `Q5_K_M`, `Q8_0`) |

---

## 🏆 Top Local Models for Tool Calling in 2025/2026

1. **Qwen 2.5 Coder (7B, 14B, 32B)**:
   - **The Gold Standard for Local MCP**: Trained specifically on tool calling, coding, and complex JSON schemas.
   - Minimal argument hallucination even with multiple tools.
2. **Llama 3.3 70B**:
   - Best-in-class general reasoning among open-weights models; reliably coordinates multi-step MCP agentic tool loops.
3. **DeepSeek-R1 (14B / 32B distillations & 671B full)**:
   - Capable of deep "chain-of-thought" deliberation before selecting and verifying tool calls.
4. **Llama 3.2 (1B, 3B)**:
   - Ultra-lightweight edge models suitable for single, simple tool-calling tasks on constrained hardware.

---

## 🚀 Setting Up MCP with Ollama

### Step 1: Pull Tool-Capable Models
Ensure you are using a model fine-tuned for tool use (e.g. Qwen 2.5 Coder or Llama 3.3):

```bash
# Recommended daily driver for coding and tools (14B ~ 9GB VRAM)
ollama pull qwen2.5-coder:14b

# Lightweight 8B model
ollama pull qwen2.5-coder:7b
ollama pull llama3.1:8b-instruct-q4_K_M

# Flagship 70B model (requires 40GB+ VRAM or high unified memory)
ollama pull llama3.3:70b
```

### Step 2: Native Tool Calling via Ollama API

Ollama supports direct function/tool calling natively in `/api/chat`:

```python
import httpx

response = httpx.post(
    "http://localhost:11434/api/chat",
    json={
        "model": "qwen2.5-coder:14b",
        "messages": [{"role": "user", "content": "What is the weather in London?"}],
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "get_current_weather",
                    "description": "Get real-time weather metrics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {"type": "string", "description": "City name"}
                        },
                        "required": ["location"]
                    }
                }
            }
        ],
        "stream": False,
        "options": {"num_ctx": 16384}
    }
)

result = response.json()
print("Model Response:", result["message"].get("tool_calls"))
```

### Step 3: Connecting via OpenAI Compatibility Layer

Many MCP hosts (Continue.dev, Cline, Cursor, LiteLLM) connect to Ollama via its OpenAI-compatible endpoint:

```text
Base URL: http://localhost:11434/v1
API Key: ollama (placeholder)
Model Name: qwen2.5-coder:14b
```

---

## ⚡ vLLM Production Tool Calling Setup

When running vLLM for high-concurrency MCP server routing, enable auto tool parsing:

```bash
vllm serve Qwen/Qwen2.5-Coder-14B-Instruct \
  --enable-auto-tool-choice \
  --tool-call-parser hermes \
  --max-model-len 16384 \
  --port 8000
```

---

## 💡 Best Practices for Local MCP Execution

> [!TIP]
> **Keep Tool Schemas Compact & Explicit**
> Small models (7B - 14B) perform best when tool parameters are flat types (`string`, `number`, `boolean`, `array of strings`). Always add concise `.describe("...")` annotations to guide the model.

> [!WARNING]
> **Context Window Sizing (`num_ctx`)**
> Default Ollama context window size is often set to `2048` tokens. A typical set of 5-10 MCP tools consumes 1,500+ tokens in tool definitions alone!
> Always configure:
> ```json
> {
>   "options": {
>     "num_ctx": 16384
>   }
> }
> ```
