# Security & Best Practices: Error Handling & Resilience

Resilient MCP servers handle network flakiness, rate limits, schema validation failures, and process signals without crashing the underlying host connection.

---

## 🛑 Standard JSON-RPC Error Codes

| Code | Meaning | Cause |
| :--- | :--- | :--- |
| `-32700` | Parse Error | Invalid JSON string received by server |
| `-32600` | Invalid Request | Payload does not follow JSON-RPC 2.0 structure |
| `-32601` | Method Not Found | Requested method (`tools/unknown`) does not exist |
| `-32602` | Invalid Params | Arguments fail tool input JSON Schema validation |
| `-32603` | Internal Error | Unhandled server exception during processing |

---

## 💡 Distinguishing RPC Errors vs Tool Execution Errors

> [!IMPORTANT]
> - Use JSON-RPC errors (`-32602`, `-32601`) ONLY when protocol RPC signaling fails.
> - When a tool runs normally but encounters a domain error (e.g. `User not found`, `HTTP 404`), return `isError: true` inside the result content instead of crashing the RPC connection.

```json
{
  "jsonrpc": "2.0",
  "id": 50,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: User ID 999 does not exist in database."
      }
    ],
    "isError": true
  }
}
```

This allows the LLM to read the error message, reflect on its mistake, and attempt a corrected tool call!

---

## 🔄 Exponential Backoff & Retry Pattern

For network integrations (REST APIs, cloud services), implement exponential backoff:

```typescript
async function fetchWithRetry(url: string, retries = 3, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      if (response.status === 429) {
        // Rate limited - back off longer
        await new Promise(res => setTimeout(res, delayMs * Math.pow(2, i)));
        continue;
      }
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delayMs * Math.pow(2, i)));
    }
  }
}
```
