import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Database from "better-sqlite3";
import path from "path";
import { z } from "zod";

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

// Initialize modern McpServer instance
const server = new McpServer({
  name: "sqlite-notes-server",
  version: "1.0.0"
});

// 1. Tool: create_note
server.tool(
  "create_note",
  "Creates a new note with a title, content, and optional comma-separated tags.",
  {
    title: z.string().describe("Title of the note"),
    content: z.string().describe("Body text content of the note"),
    tags: z.string().optional().describe("Comma-separated tags (e.g. 'work,todo,mcp')")
  },
  async ({ title, content, tags }) => {
    try {
      const stmt = db.prepare("INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)");
      const info = stmt.run(title, content, tags || "");
      return {
        content: [
          {
            type: "text",
            text: `Note created successfully! Assigned ID: ${info.lastInsertRowid}`
          }
        ]
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Database Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 2. Tool: search_notes
server.tool(
  "search_notes",
  "Searches notes by matching query keywords in title, content, or tags.",
  {
    query: z.string().describe("Search keyword")
  },
  async ({ query }) => {
    try {
      const term = `%${query}%`;
      const stmt = db.prepare(
        "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? ORDER BY id DESC"
      );
      const rows = stmt.all(term, term, term);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Database Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 3. Tool: list_all_notes
server.tool(
  "list_all_notes",
  "Lists all stored notes from the database.",
  {},
  async () => {
    try {
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
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Database Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 4. Tool: delete_note
server.tool(
  "delete_note",
  "Deletes a note by its numeric ID.",
  {
    id: z.number().describe("Numeric ID of the note to delete")
  },
  async ({ id }) => {
    try {
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
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Database Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

// 5. Expose Database Schema as a Resource
server.resource(
  "notes_schema",
  "sqlite://notes/schema",
  {
    description: "Returns the DDL schema statement for the notes table",
    mimeType: "text/plain"
  },
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: "CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, tags TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
        }
      ]
    };
  }
);

// 6. Connect Stdio Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SQLite Notes MCP Server running on stdio.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
