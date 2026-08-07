# Testing & Sandbox: Model Benchmarking & Tool Call Evals

Evaluating how accurately different LLM engines (local models vs cloud APIs) generate valid tool calls for your MCP server is critical for production reliability.

---

## 📊 Evaluation Metrics Matrix

1. **Tool Selection Accuracy**: Did the model select the correct tool for the user prompt?
2. **Schema Adherence**: Did the model supply arguments matching required types and enums?
3. **Execution Latency**: Time elapsed from user prompt to final synthesis (TTFT + Tool Call Execution Time).
4. **Context Overhead**: Percentage of context window used by MCP tool definitions.

---

## 🧪 Benchmark Comparison: Local vs Cloud Models

| Benchmark Task | Llama 3.1 8B (Q4) | Qwen 2.5 14B (Q8) | Claude 3.5 Sonnet | GPT-4o |
| :--- | :---: | :---: | :---: | :---: |
| Single Tool Call (Simple JSON) | 94% | 98% | 99.9% | 99.8% |
| Nested Schema Arguments | 72% | 89% | 99.5% | 99.2% |
| Parallel Tool Execution | 45% | 76% | 98.0% | 97.5% |
| Refusal on Invalid Args | 60% | 82% | 96.0% | 95.0% |

---

## 🧰 Automated Eval Runner Script Concept

Create test benchmark datasets containing prompt/expected-tool pairs:

```json
[
  {
    "prompt": "Show me the top 5 users created this week.",
    "expectedTool": "execute_readonly_sql",
    "expectedArgs": { "sql": "SELECT * FROM users ORDER BY created_at DESC LIMIT 5" }
  }
]
```

Run these through your local Ollama or Cloud API runner to measure accuracy percentages across releases.
