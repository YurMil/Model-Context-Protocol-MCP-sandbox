import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import Database from "better-sqlite3";
import path from "path";
import fileURLToPath from "url";

// Initialize SQLite database
const dbPath = path.join(process.cwd(), "notes.db");
const db = new Database(dbPath);

// Create SQLite table schema if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize MCP Server instance
const server = new Server(
  {
    name: "sqlite-notes-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// 1. Expose Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_note",
        description: "Creates a new note with a title, content, and optional comma-separated tags.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the note" },
            content: { type: "string", description: "Body text content of the note" },
            tags: { type: "string", description: "Comma-separated tags (e.g. 'work,todo,mcp')" }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "search_notes",
        description: "Searches notes by matching query keywords in title, content, or tags.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword" }
          },
          required: ["query"]
        }
      },
      {
        name: "list_all_notes",
        description: "Lists all stored notes from the database.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "delete_note",
        description: "Deletes a note by its ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number", description: "Numeric ID of the note to delete" }
          },
          required: ["id"]
        }
      }
    ]
  };
});

// 2. Handle Tool Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "create_note") {
      const title = String(args?.title || "");
      const content = String(args?.content || "");
      const tags = String(args?.tags || "");

      const stmt = db.prepare("INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)");
      const info = stmt.run(title, content, tags);

      return {
        content: [
          {
            type: "text",
            text: `Note created successfully! ID: ${info.lastInsertRowid}`
          }
        ]
      };
    }

    if (name === "search_notes") {
      const query = `%${args?.query || ""}%`;
      const stmt = db.prepare(
        "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? ORDER BY id DESC"
      );
      const rows = stmt.all(query, query, query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    }

    if (name === "list_all_notes") {
      const stmt = db.prepare("SELECT * FROM notes ORDER BY id DESC");
      const rows = stmt.all();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    }

    if (name === "delete_note") {
      const id = Number(args?.id);
      const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
      const info = stmt.run(id);

      return {
        content: [
          {
            type: "text",
            text: info.changes > 0 ? `Note ID ${id} deleted successfully.` : `No note found with ID ${id}.`
          }
        ]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `Database Error: ${err.message}` }],
      isError: true
    };
  }
});

// 3. Register Database Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "sqlite://notes/schema",
        name: "Notes SQLite Database Schema",
        description: "Returns the DDL schema statement for notes table",
        mimeType: "text/plain"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "sqlite://notes/schema") {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT, content TEXT, tags TEXT, created_at DATETIME);"
        }
      ]
    };
  }
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// 4. Start Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
