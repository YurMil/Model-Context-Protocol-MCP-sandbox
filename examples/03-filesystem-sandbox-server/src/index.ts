import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

// Define allowed sandbox root directory (current directory or specified root)
const ALLOWED_ROOT = path.resolve(process.env.SANDBOX_ROOT || process.cwd());

function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(ALLOWED_ROOT, relativePath);
  if (!resolved.startsWith(ALLOWED_ROOT)) {
    throw new Error(`Security Exception: Access denied. Path '${relativePath}' escapes allowed sandbox root.`);
  }
  return resolved;
}

const server = new McpServer({
  name: "filesystem-sandbox-server",
  version: "1.0.0"
});

// 1. Tool: list_directory
server.tool(
  "list_directory",
  "Lists all files and directories inside a relative sandbox folder path.",
  {
    relativePath: z.string().default(".").describe("Relative directory path (e.g. '.' or 'src')")
  },
  async ({ relativePath }) => {
    try {
      const safePath = resolveSafePath(relativePath);
      const entries = await fs.readdir(safePath, { withFileTypes: true });

      const result = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile()
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 2. Tool: read_file
server.tool(
  "read_file",
  "Reads utf-8 text file contents inside the sandbox.",
  {
    relativePath: z.string().describe("Relative file path within sandbox")
  },
  async ({ relativePath }) => {
    try {
      const safePath = resolveSafePath(relativePath);
      const data = await fs.readFile(safePath, "utf-8");

      return {
        content: [{ type: "text", text: data }]
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 3. Tool: search_files_by_keyword
server.tool(
  "search_files_by_keyword",
  "Searches text files in sandbox for a matching keyword.",
  {
    keyword: z.string().describe("Search keyword")
  },
  async ({ keyword }) => {
    try {
      const query = keyword.toLowerCase();
      const safeRoot = resolveSafePath(".");
      const entries = await fs.readdir(safeRoot, { recursive: true, withFileTypes: true });

      const matches: string[] = [];
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith(".")) {
          try {
            const filePath = path.join(entry.path || safeRoot, entry.name);
            const content = await fs.readFile(filePath, "utf-8");
            if (content.toLowerCase().includes(query)) {
              matches.push(path.relative(safeRoot, filePath));
            }
          } catch {
            // Ignore unreadable binary files
          }
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ keyword, matchingFiles: matches }, null, 2) }]
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Filesystem Sandbox MCP Server running on stdio.");
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
