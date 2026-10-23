# Boilerplate Template: TypeScript MCP Server

Complete starter boilerplate for creating production-ready Node.js / TypeScript MCP servers using the modern `@modelcontextprotocol/sdk` high-level `McpServer` and `Zod` validation.

---

## 💡 Modern High-Level `McpServer` vs Legacy `Server`

The official TypeScript SDK provides two APIs:
1. **High-Level `McpServer` (Recommended Standard)**:
   - Uses `zod` schemas for input definitions.
   - Automatically handles parameter type inference, JSON Schema generation, and runtime validation.
   - Drastically reduces boilerplate code for Tools, Resources, and Prompts.
2. **Low-Level `Server`**:
   - Requires manual JSON Schema declarations and raw JSON-RPC request handlers (`setRequestHandler(ListToolsRequestSchema, ...)`). Useful only when building custom protocol middleware or dynamic schema proxies.

---

## 📦 `package.json`

```json
{
  "name": "ts-mcp-server-template",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0"
  }
}
```

---

## 💻 `src/index.ts` (Modern High-Level Standard)

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Initialize McpServer instance
const server = new McpServer({
  name: "ts-mcp-sandbox-server",
  version: "1.0.0"
});

// 2. Register Tool with Zod Validation
// Types for 'a' and 'b' are automatically inferred as numbers
server.tool(
  "calculate_sum",
  "Adds two numbers together",
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number")
  },
  async ({ a, b }) => {
    const sum = a + b;
    return {
      content: [
        {
          type: "text",
          text: `The sum of ${a} and ${b} is ${sum}.`
        }
      ]
    };
  }
);

// 3. Register Static Resource
server.resource(
  "server_info",
  "config://server/info",
  {
    description: "Metadata information regarding this MCP server instance",
    mimeType: "application/json"
  },
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            name: "ts-mcp-sandbox-server",
            version: "1.0.0",
            uptime_seconds: process.uptime()
          }, null, 2)
        }
      ]
    };
  }
);

// 4. Register Dynamic Resource Template
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: `Hello, ${name}! Welcome to the Model Context Protocol sandbox.`
        }
      ]
    };
  }
);

// 5. Register Prompt Template
server.prompt(
  "review_code",
  "Prompt template to review code snippet",
  {
    code: z.string().describe("Source code snippet to review"),
    language: z.string().optional().describe("Programming language")
  },
  ({ code, language }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please review this ${language || "code"} snippet for security, performance, and best practices:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``
        }
      }
    ]
  })
);

// 6. Connect Transport and Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TypeScript MCP Server running on stdio.");
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
```

---

## 🔍 How to Test

```bash
# Run in development mode with live reload
npm run dev

# Inspect with official MCP web UI
npm run inspect
```
