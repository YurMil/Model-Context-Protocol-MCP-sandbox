# Testing & Sandbox: Unit Testing & Mocking Frameworks

Automated testing ensures your MCP server complies with protocol schemas, handles invalid inputs gracefully, and avoids breaking changes.

---

## 🧪 TypeScript Unit Testing Pattern (Vitest / Jest)

```typescript
// tests/server.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMyMcpServer } from "../src/server.js";

describe("MCP Server Tools", () => {
  let client: Client;
  let serverTransport: InMemoryTransport;
  let clientTransport: InMemoryTransport;

  beforeEach(async () => {
    const [t1, t2] = InMemoryTransport.createLinkedPair();
    serverTransport = t1;
    clientTransport = t2;

    const server = createMyMcpServer();
    await server.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  it("should list available tools", async () => {
    const result = await client.listTools();
    expect(result.tools).toContainEqual(
      expect.objectContaining({ name: "calculate" })
    );
  });

  it("should execute tool call correctly", async () => {
    const result = await client.callTool({
      name: "calculate",
      arguments: { expression: "10 + 5" }
    });
    expect(result.content[0].text).toBe("15");
  });
});
```

---

## 🐍 Python Integration Testing Pattern (pytest)

```python
# tests/test_py_server.py
import pytest
import pytest_asyncio
from mcp.client.session import ClientSession
from mcp.client.stdio import stdio_client

@pytest.mark.asyncio
async def test_python_mcp_tools():
    # Connect via stdio client transport
    async with stdio_client(["uv", "run", "servers/py-fetch-server/main.py"]) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            assert any(tool.name == "fetch_url" for tool in tools.tools)
```
