# Boilerplate Template: TypeScript MCP Server

Complete starter boilerplate for creating production-ready Node.js / TypeScript MCP servers using `@modelcontextprotocol/sdk`.

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
    "@modelcontextprotocol/sdk": "^1.0.0",
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

## 💻 `src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Initialize server instance
const server = new Server(
  {
    name: "ts-mcp-sandbox-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// 1. Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate_sum",
        description: "Adds two numbers together",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" }
          },
          required: ["a", "b"]
        }
      }
    ]
  };
});

// 2. Handle Tool Call Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "calculate_sum") {
    const a = Number(args?.a);
    const b = Number(args?.b);
    if (isNaN(a) || isNaN(b)) {
      return {
        content: [{ type: "text", text: "Error: Parameters 'a' and 'b' must be numbers." }],
        isError: true
      };
    }
    const result = a + b;
    return {
      content: [{ type: "text", text: `Sum: ${result}` }]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

// 3. Start Standard I/O Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TypeScript MCP Server initialized successfully.");
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
```
