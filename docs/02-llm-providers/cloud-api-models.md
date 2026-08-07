# Cloud API Models (OpenAI, Anthropic, Gemini, Groq, Mistral)

Cloud LLM API providers offer state-of-the-art reasoning, huge context windows, and native tool-use support suitable for complex MCP tool sets.

---

## 🌩️ Cloud Provider Feature Matrix

| Provider | flagship Model | Max Context | Tool Calling Capabilities | Recommended Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Anthropic** | Claude 3.5 Sonnet / Claude 3 Opus | 200,000 tokens | Native MCP Host in Claude Desktop, parallel tool calling | Primary choice for agentic coding & complex MCP workflows |
| **OpenAI** | GPT-4o / GPT-4o-mini | 128,000 tokens | Strict JSON Schema support, function calling | Production web apps & high-throughput API workflows |
| **Google** | Gemini 1.5 Pro / Gemini 1.5 Flash | 1,000,000+ tokens | Function calling, multimodal inputs (images/video to tools) | Large-context document processing + MCP |
| **Groq** | Llama 3.1 70B / Mixtral 8x7B | 128,000 tokens | Fast inference tool calls (500+ tok/s) | Ultra-low latency MCP tool execution |
| **Mistral AI** | Mistral Large / Codestral | 128,000 tokens | Function calling | Specialized coding & multi-language support |

---

## 🔐 API Key Management & Environment Configuration

Never hardcode API keys in code or MCP server source files. Inject them securely via environment variables or secret managers:

```bash
# Linux/macOS
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-proj-..."
export GEMINI_API_KEY="AIzaSy..."
export GROQ_API_KEY="gsk_..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."
$env:OPENAI_API_KEY="sk-proj-..."
$env:GEMINI_API_KEY="AIzaSy..."
$env:GROQ_API_KEY="gsk_..."
```

---

## ⚡ Parallel Tool Execution

Modern Cloud LLMs (GPT-4o, Claude 3.5 Sonnet) can emit **multiple tool calls in a single turn**:

```json
{
  "role": "assistant",
  "tool_calls": [
    {
      "id": "call_abc123",
      "function": { "name": "read_file", "arguments": "{\"path\": \"src/index.ts\"}" }
    },
    {
      "id": "call_def456",
      "function": { "name": "read_file", "arguments": "{\"path\": \"package.json\"}" }
    }
  ]
}
```

The MCP Client Host executes both tool requests concurrently across the MCP server(s) and returns both results back to the LLM in parallel, significantly reducing latency.
