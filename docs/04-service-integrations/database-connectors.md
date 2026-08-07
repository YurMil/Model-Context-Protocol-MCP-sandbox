# Service Integrations: Database Connectors

Connecting database systems to MCP enables LLMs to query schemas, inspect tables, and safely execute controlled SQL queries or transactions.

---

## 🗄️ Supported Database Patterns

| Database | Resource URIs | Common Tools Exposed | Security Guardrails |
| :--- | :--- | :--- | :--- |
| **PostgreSQL / Neon** | `postgres://db/table_name` | `run_sql`, `describe_table`, `list_tables` | Read-only transactions, SQL parser checks |
| **Supabase** | `supabase://project_id/tables` | `execute_sql`, `list_migrations`, `get_logs` | RLS (Row Level Security), Service Key isolation |
| **SQLite** | `sqlite:///path/to/db.sqlite` | `query`, `explain_query`, `schema_dump` | Run in `mode=ro` (read-only SQLite URI) |
| **Redis** | `redis://cache/keys` | `get_key`, `scan_keys`, `cache_stats` | Key pattern matching, strict memory limits |

---

## 🛠️ PostgreSQL / Neon Integration Pattern (TypeScript)

```typescript
// Example: Safely exposing SQL execution to MCP
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export function registerDatabaseTools(server: Server) {
  server.tool(
    "execute_readonly_sql",
    {
      sql: { type: "string", description: "SQL SELECT query to execute" }
    },
    async ({ sql }) => {
      // Security Check: Enforce SELECT query only
      const trimmed = sql.trim().toLowerCase();
      if (!trimmed.startsWith("select") && !trimmed.startsWith("explain")) {
        return {
          isError: true,
          content: [{ type: "text", text: "Security Error: Only SELECT or EXPLAIN statements are permitted." }]
        };
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN READ ONLY;");
        const res = await client.query(sql);
        await client.query("COMMIT;");

        return {
          content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }]
        };
      } finally {
        client.release();
      }
    }
  );
}
```

---

## 🛡️ Database Safety Checklist

1. **Read-Only Connections**: Connect with a dedicated database user granted only `SELECT` privileges on specific schemas.
2. **Limit Row Return Count**: Append `LIMIT 100` automatically to prevent overflowing LLM context memory.
3. **Parametrized Queries**: Never concatenate user input directly into SQL strings.
