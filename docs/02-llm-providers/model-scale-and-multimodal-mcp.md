# Designing MCP for Model Scale & Multimodality

Building production MCP servers requires adapting tool schemas, context payloads, and response content to the **parameter scale** and **multimodal capabilities** of the target Large Language Model.

A tool designed for a 200B+ cloud reasoning model (e.g., Claude 3.7 Sonnet or Gemini 2.0 Pro) will frequently fail when invoked by an edge 3B model (e.g., Llama 3.2 3B or Qwen 2.5 3B). Similarly, multimodal models unlock visual feedback loops that text-only models cannot process.

---

## 🧭 High-Level Capability & Architecture Matrix

| Model Tier | Parameter Size | Examples | Max Active Tools | Schema Complexity | Multimodal Tool Returns | Recommended MCP Transport |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: |
| **Edge / Mobile** | 1B – 3B | Llama 3.2 (1B/3B), SmolLM2 | 1 – 3 tools | Ultra-flat (strings, ints only, no nested objects) | ❌ Text-only | `stdio` |
| **Mid-Range Local** | 7B – 14B | Qwen 2.5 Coder 14B, Llama 3.1 8B | 5 – 10 tools | Flat with strict enums & default values | ⚠️ Text + ASCII/Markdown | `stdio` |
| **Large Open-Weights** | 32B – 70B+ | Qwen 2.5 Coder 32B, Llama 3.3 70B, DeepSeek-R1 | 15 – 30 tools | Moderate nesting, self-healing tool errors | ⚠️ Text + OCR / Base64 vision (if VLM) | `stdio` / Streamable HTTP |
| **Frontier Cloud & Reasoning** | 200B+ / MoE | Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Pro | 50+ tools | Highly nested JSON Schemas, dynamic discovery | ✅ Full Multimodal (Images, Blobs, Artifacts) | Streamable HTTP / `stdio` |

---

## 🔍 Part 1: How Model Scale Dictates MCP Architecture

```
Small Models (1B - 7B)                     Frontier Models (70B - Frontier)
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ • Strict grammar / JSON mode    │       │ • Autonomous tool chaining      │
│ • Single responsibility tools   │       │ • Complex nested objects & arrays│
│ • Flat scalar parameters        │       │ • Self-healing error reflection │
│ • Server-side semantic filtering│       │ • Parallel multi-tool execution │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### 1. Edge & Small Models (1B – 3B Parameters)
- **Bottlenecks**: Extremely limited attention capacity, high rate of JSON syntax hallucination, fragile key mapping.
- **MCP Architectural Rules**:
  1. **Zero Nested Objects**: Never pass nested objects (`{"config": {"db": {"host": ...}}}`). Keep arguments flat:
     ```typescript
     // ❌ BAD for 3B models:
     server.tool("connect", { config: z.object({ host: z.string(), port: z.number() }) }, ...);

     // ✅ GOOD for 3B models:
     server.tool("connect", { host: z.string(), port: z.number().default(5432) }, ...);
     ```
  2. **Aggressive Tool Filtering**: Do not pass 20 tools in `tools/list`. Use a semantic router to pass only the 2 or 3 tools relevant to the immediate user prompt.
  3. **Strict Fallbacks**: Small models struggle with custom error messages. Provide descriptive defaults for optional parameters.

### 2. Mid-Range Local Models (7B – 14B Parameters)
- **Sweet Spot**: Models like **Qwen 2.5 Coder 14B** excel at tool selection when given concise parameter descriptions.
- **MCP Architectural Rules**:
  1. **Explicit Descriptions**: Always use `.describe("...")` on every parameter explaining the exact expected format (e.g. `"Date formatted as YYYY-MM-DD"`).
  2. **Constrain with Enums**: Use `z.enum([...])` rather than freeform strings to prevent parameter hallucination.
  3. **Context Window Inflation Protection**: 10 MCP tools can consume 2,000+ context tokens. Ensure the host configures `num_ctx: 16384` or higher in Ollama/vLLM.

### 3. Frontier Cloud & Deliberative Reasoning Models (70B – 400B+)
- **Strengths**: Models like **Claude 3.7 Sonnet**, **GPT-4o**, and **Gemini 2.0** can reason, form multi-step plans, emit parallel tool calls, and inspect rich outputs.
- **MCP Architectural Rules**:
  1. **Self-Healing Error Feedback**: When a tool fails, return `isError: true` accompanied by an actionable error description:
     ```json
     {
       "content": [{ "type": "text", "text": "ValidationError: 'date_to' (2026-02-30) is invalid for February. Valid range: 2026-02-01 to 2026-02-28." }],
       "isError": true
     }
     ```
     Frontier models will read this error, adjust their parameters, and automatically retry with the correct argument.
  2. **Fine-Grained Micro-Tools**: You can provide decomposed atomic tools (e.g., `list_tables`, `describe_table`, `execute_query`) rather than a monolithic all-in-one tool. The model will chain them autonomously.
  3. **Parallel Invocations**: Design tools to be stateless and idempotent so the host can invoke 5–10 calls concurrently.

---

## 👁️ Part 2: Multimodal MCP (Vision, Images & Real-Time Media)

The Model Context Protocol specification natively supports multi-part and multimodal tool outputs:

```json
{
  "result": {
    "content": [
      { "type": "text", "text": "Generated chart analysis:" },
      { "type": "image", "data": "iVBORw0KGgo...", "mimeType": "image/png" }
    ]
  }
}
```

### 1. Vision Feedback Loops (Browser Automation & CAD)
With multimodal LLMs (Claude 3.5/3.7, GPT-4o, Gemini 2.0), MCP tools can create closed-loop **Visual Agentic Workflows**:

```
┌──────────────────┐    1. navigate_page()     ┌──────────────────┐
│                  ├──────────────────────────►│                  │
│ Multimodal Model │                           │ Playwright / MCP │
│ (Vision-Enabled) │◄──────────────────────────┤ Server           │
└────────┬─────────┘    2. Returns PNG Screenshot└──────────────────┘
         │
         │ 3. Analyzes image visually:
         │    "Login button is located at (450, 310)"
         ▼
┌──────────────────┐    4. click_coordinate()  ┌──────────────────┐
│                  ├──────────────────────────►│ Browser executes │
└──────────────────┘                           └──────────────────┘
```

#### TypeScript Implementation: Multimodal Tool Response
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";

const server = new McpServer({ name: "visual-tools", version: "1.0.0" });

server.tool(
  "capture_chart_screenshot",
  "Captures a visual screenshot of a telemetry chart",
  { chartId: z.string().describe("Identifier of the telemetry chart") },
  async ({ chartId }) => {
    // Generate or fetch image buffer
    const imageBuffer = await fs.readFile(`charts/${chartId}.png`);
    const base64Data = imageBuffer.toString("base64");

    return {
      content: [
        {
          type: "text",
          text: `Rendered chart for ID: ${chartId}. Please inspect visual anomalies.`
        },
        {
          type: "image",
          data: base64Data,
          mimeType: "image/png"
        }
      ]
    };
  }
);
```

### 2. Adaptive Content Negotiation (Text vs Image)
Not all models support vision. If a text-only model (e.g. Llama 3.1 8B text, DeepSeek-R1-Distill) receives raw base64 images in tool returns, it may crash or waste thousands of context tokens on unparseable base64 strings.

#### Best Practice: Adaptive Output Formatting
Allow the client to request markdown/text summaries if vision is unsupported:

```typescript
server.tool(
  "render_diagram",
  "Renders an architecture diagram",
  {
    spec: z.string(),
    format: z.enum(["png", "mermaid_text"]).default("png").describe("Choose 'mermaid_text' for non-vision models")
  },
  async ({ spec, format }) => {
    if (format === "mermaid_text") {
      // Return lightweight text for smaller or non-multimodal models
      return { content: [{ type: "text", text: `\`\`\`mermaid\n${spec}\n\`\`\`` }] };
    }
    // Return base64 image for multimodal frontier models
    const imageBase64 = await convertMermaidToPng(spec);
    return {
      content: [{ type: "image", data: imageBase64, mimeType: "image/png" }]
    };
  }
);
```

---

## ⚡ Part 3: Real-Time Multimodal Streaming (Gemini 2.0 Live)

With ultra-low latency multimodal streaming models (e.g. Gemini 2.0 Flash Live API over WebSockets/WebRTC):
1. **Tool Invocation Latency**: Tools must respond in `< 300ms` to avoid interrupting conversational speech cadence.
2. **Progressive Rendering**: Return lightweight status immediately while offloading heavy computation to background tasks.
3. **Cancellation Resilience**: If the user interrupts the model via voice mid-tool-execution, the host will fire `notifications/cancelled`. The MCP server must immediately release locks and abort pending network requests.

---

## 📋 Architecture Checklist for MCP Builders

- [ ] **Are schemas flat enough for your target model tier?** (Flat for ≤ 14B; nested only for frontier models).
- [ ] **Are parameter constraints documented with `.describe()`?** (Mandatory for reliable open-weights tool calling).
- [ ] **Does your server provide text fallbacks for multimodal outputs?** (Prevents context poisoning on text-only LLMs).
- [ ] **Does tool execution support cancellation?** (Critical for real-time voice and streaming multimodal hosts).
- [ ] **Are errors returned as structured `isError: true` messages?** (Enables cloud reasoning models to self-heal).
