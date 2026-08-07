# LLM Provider Integration Architecture

Connecting Large Language Models (LLMs) to MCP requires converting MCP tool descriptions and schema specifications into the native function-calling formats expected by each specific LLM engine.

---

## 🔄 Translation Flow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   MCP Server    │       │   MCP Client    │       │   LLM API /     │
│   Tool Schema   ├──────►│   Translator    ├──────►│   Local Model   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
 (JSON Schema)             Converts MCP Tool         Native Tool Format
                           Definition                (OpenAI tool call,
                                                     Claude tool call,
                                                     Ollama tools)
```

---

## 📐 Schema Translation Reference

### 1. MCP Standard Tool Definition

```json
{
  "name": "get_weather",
  "description": "Get current weather for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or ZIP code"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "default": "celsius"
      }
    },
    "required": ["location"]
  }
}
```

### 2. OpenAI / Compatible Format (`tools` array)

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get current weather for a location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": { "type": "string", "description": "City name or ZIP code" },
        "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
      },
      "required": ["location"]
    }
  }
}
```

### 3. Anthropic Messages API Format (`tools` array)

```json
{
  "name": "get_weather",
  "description": "Get current weather for a location",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": { "type": "string", "description": "City name or ZIP code" },
      "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["location"]
  }
}
```

---

## 🎯 Challenges & Architectural Solutions

### 1. Context Window Bloat
- **Problem**: Passing dozens of detailed JSON Schemas to an LLM uses up thousands of context tokens on every message turn.
- **Solution**: 
  - **Dynamic Tool Selection**: Filter tool schemas based on semantic search or intent detection before invoking the main LLM.
  - **Compact Descriptions**: Keep parameter descriptions clear and concise.

### 2. Schema Strictness Variations
- **Problem**: Cloud models (Claude 3.5, GPT-4o) handle complex nested JSON Schemas effortlessly, whereas smaller local models (Llama 3.1 8B, Qwen 2.5 7B) can hallucinate invalid arguments if schemas are too complex.
- **Solution**: Flatten schemas and enforce validation at the MCP server level using JSON Schema validators (e.g. `ajv` or `pydantic`).
