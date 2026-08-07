# API Gateways, Routers & Subscription Proxies

When managing multiple LLM backends across teams, subscription plans, or multi-tenant deployments, using an **API Gateway / Proxy** acts as a unified abstraction layer for MCP clients.

---

## 🌐 Unified Architecture with Gateway Proxies

```
┌─────────────────────────────────────────────────────────┐
│                      MCP Client                         │
└────────────────────────────┬────────────────────────────┘
                             │  OpenAI-Compatible / Custom API
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 API Gateway / Router                    │
│           (LiteLLM Proxy / OpenRouter / Portkey)        │
│  ┌──────────────────┐ ┌────────────────┐ ┌───────────┐  │
│  │ Auth & Rate Limit│ │ Key Rotation   │ │ Fallbacks │  │
│  └──────────────────┘ └────────────────┘ └───────────┘  │
└──────┬──────────────────────┬────────────────────┬──────┘
       │                      │                    │
       ▼                      ▼                    ▼
┌──────────────┐       ┌──────────────┐     ┌──────────────┐
│ OpenAI API   │       │ Anthropic    │     │ Local Ollama │
│ (Paid Tier)  │       │ (Subscription│     │ (On-Prem)    │
└──────────────┘       └──────────────┘     └──────────────┘
```

---

## 🛠️ LiteLLM Gateway Setup for MCP

[LiteLLM](https://github.com/BerriAI/litellm) allows routing requests from any MCP client to 100+ LLMs using a standardized OpenAI format.

### Step 1: Create `config.yaml`
```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20240620
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: local-llama
    litellm_params:
      model: ollama/llama3.1:8b-instruct
      api_base: http://localhost:11434

router_settings:
  routing_strategy: usage-based-routing-v2
  num_retries: 3
  timeout: 30
```

### Step 2: Launch LiteLLM Proxy Server
```bash
pip install litellm[proxy]
litellm --config config.yaml --port 4000
```

Now connect any MCP client host to `http://localhost:4000/v1`!

---

## 🌍 OpenRouter Integration

OpenRouter provides access to dozens of models under a single API key with unified function calling support.

```json
{
  "env": {
    "OPENAI_BASE_URL": "https://openrouter.ai/api/v1",
    "OPENAI_API_KEY": "sk-or-v1-..."
  }
}
```

- **Model format**: `anthropic/claude-3.5-sonnet`, `meta-llama/llama-3.1-70b-instruct`, `google/gemini-flash-1.5`.
- OpenRouter automatically transforms OpenAI function-calling tool format into provider-specific syntax.
