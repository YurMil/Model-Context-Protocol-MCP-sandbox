import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Define allowed sandbox root directory (current directory or specified root)
const ALLOWED_ROOT = path.resolve(process.env.SANDBOX_ROOT || process.cwd());

function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(ALLOWED_ROOT, relativePath);
  if (!resolved.startsWith(ALLOWED_ROOT)) {
    throw new Error(`Security Exception: Access denied. Path '${relativePath}' escapes allowed sandbox root.`);
  }
  return resolved;
}

const server = new Server(
  {
    name: "filesystem-sandbox-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_directory",
        description: "Lists all files and directories inside a relative sandbox folder path.",
        inputSchema: {
          type: "object",
          properties: {
            relativePath: { type: "string", description: "Relative directory path (e.g. '.' or 'src')", default: "." }
          }
        }
      },
      {
        name: "read_file",
        description: "Reads utf-8 text file contents inside the sandbox.",
        inputSchema: {
          type: "object",
          properties: {
            relativePath: { type: "string", description: "Relative file path" }
          },
          required: ["relativePath"]
        }
      },
      {
        name: "search_files_by_keyword",
        description: "Searches text files in sandbox for a matching keyword.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: { type: "string", description: "Search keyword" }
          },
          required: ["keyword"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_directory") {
      const rel = String(args?.relativePath || ".");
      const safePath = resolveSafePath(rel);
      const entries = await fs.readdir(safePath, { withFileTypes: true });

      const result = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile()
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    if (name === "read_file") {
      const rel = String(args?.relativePath || "");
      const safePath = resolveSafePath(rel);
      const data = await fs.readFile(safePath, "utf-8");

      return {
        content: [{ type: "text", text: data }]
      };
    }

    if (name === "search_files_by_keyword") {
      const keyword = String(args?.keyword || "").toLowerCase();
      const safeRoot = resolveSafePath(".");
      const entries = await fs.readdir(safeRoot, { recursive: true, withFileTypes: true });

      const matches: string[] = [];
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith(".")) {
          try {
            const filePath = path.join(entry.path || safeRoot, entry.name);
            const content = await fs.readFile(filePath, "utf-8");
            if (content.toLowerCase().includes(keyword)) {
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
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
