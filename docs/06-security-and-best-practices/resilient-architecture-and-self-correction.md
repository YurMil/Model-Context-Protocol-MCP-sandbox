# Resilient MCP Architecture: Self-Correction, Verification & Anti-Collapse Patterns

When autonomous agents or LLMs interact with external systems through MCP, poorly architected tools can trigger **model collapse**—a cascading failure where an LLM enters infinite retry loops, hallucinates non-existent arguments, or poisons its own context window with megabytes of unstructured output.

This guide outlines professional architectural patterns for engineering resilient MCP servers that enable LLMs to **self-verify, self-correct, and gracefully recover from errors**.

---

## 🌪️ Root Causes of Model Collapse in MCP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE MODEL COLLAPSE CASCADE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Bloated Tool Payload    ➔ Thousands of tokens fill the context window    │
│ 2. Context Poisoning       ➔ Model loses track of initial system directives │
│ 3. Cryptic Error Message   ➔ "Error code 500" gives no clue on how to fix   │
│ 4. Hallucinated Arguments  ➔ Model guesses random parameters                │
│ 5. Infinite Retry Loop     ➔ Model exhausts token budget without progress   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. Payload Budgeting & Anti-Poisoning Architecture

An MCP server must act as a **curator, not a dumb pipe**. Dumping raw database dumps, 10,000-line logs, or uncompressed HTML directly into tool returns will exhaust context and degrade model reasoning.

### Rules of Payload Budgeting
1. **Mandatory Pagination Defaults**: Never allow unbounded queries. Enforce `limit` with a sensible ceiling (e.g., max 50 items).
2. **Structural Summarization**: Return schema headers and sample rows rather than full tables.
3. **Head/Tail Truncation with Token Warnings**: If log data exceeds the budget (e.g. 8,000 characters), truncate the middle and explicitly warn the model:
   ```json
   {
     "content": [
       {
         "type": "text",
         "text": "=== Log Output (Truncated: Showing first 20 and last 20 lines of 1,450 lines) ===\n[Line 1] ...\n... [1,410 lines omitted. Use 'query_logs' with specific timestamp filter to inspect] ...\n[Line 1450] Error: Database connection lost."
       }
     ]
   }
   ```

---

## 🛡️ 2. The Two-Phase Verification Pattern (Preview ➔ Apply)

For mutating or destructive actions (file edits, database drops, Git pushes, cloud provisioning), high-reliability architectures implement a **Two-Phase Commit** or `dry_run` contract.

```
┌──────────────────────────┐                   ┌──────────────────────────┐
│        LLM Agent         │                   │        MCP Server        │
└────────────┬─────────────┘                   └────────────┬─────────────┘
             │                                              │
             │ 1. call_tool(dry_run: true)                  │
             ├─────────────────────────────────────────────►│
             │                                              │ Validates input,
             │                                              │ calculates diff,
             │ 2. returns { diff, wouldSucceed: true }      │ checks permissions
             │◄─────────────────────────────────────────────┤
             │                                              │
             │ 3. Evaluates diff: "Looks correct"           │
             │                                              │
             │ 4. call_tool(dry_run: false, confirmationId) │
             ├─────────────────────────────────────────────►│ Executes actual mutation
             │                                              │
             │ 5. returns { success: true }                 │
             │◄─────────────────────────────────────────────┤
```

### TypeScript Pattern: `dry_run` & Validation
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "safe-database", version: "1.0.0" });

server.tool(
  "execute_sql_migration",
  "Executes a SQL migration with mandatory dry-run simulation capability",
  {
    sql: z.string().describe("SQL DDL/DML statement to execute"),
    dry_run: z.boolean().default(true).describe("Set to true to preview syntax and affected rows without committing")
  },
  async ({ sql, dry_run }) => {
    // 1. Dry run phase: EXPLAIN / lint query
    if (dry_run) {
      const lintResult = await lintSqlStatement(sql);
      if (!lintResult.valid) {
        return {
          isError: true,
          content: [{ type: "text", text: `Syntax Verification Failed: ${lintResult.error}` }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `[SIMULATION SUCCESS]: Query is valid. Estimated affected rows: ${lintResult.estimatedRows}. Re-run with dry_run=false to execute.`
        }]
      };
    }

    // 2. Real execution phase
    const execution = await runDatabaseCommit(sql);
    return {
      content: [{ type: "text", text: `Migration applied successfully in ${execution.durationMs}ms.` }]
    };
  }
);
```

---

## 🔄 3. Actionable Error Payloads for Self-Correction

When a tool fails, returning a generic error string like `"Invalid input"` or `"500 Internal Server Error"` guarantees model hallucination. The model has no information on what token caused the issue.

### The 4-Component Error Architecture
Every tool error must communicate:
1. **What failed** (The exact parameter or constraint violated).
2. **Why it failed** (The business logic or parser rule).
3. **What is valid** (The acceptable domain, enum, or range).
4. **Concrete suggestion** (How the model should reformulate the call).

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "INVALID_PARAMETER_ERROR in 'region': Value 'us-central' is invalid.\nAllowed regions: ['us-east-1', 'us-west-2', 'eu-west-1'].\nSuggestion: If targeting North America, invoke with region='us-east-1'."
    }
  ]
}
```

When frontier models (Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Pro) receive this structured feedback, they **self-heal on turn 2** without human intervention.

---

## 🎯 4. Tool Orthogonality & Disambiguation

Having overlapping or ambiguous tools causes the LLM's attention heads to split probabilities between options, leading to indecision and wrong tool selection.

```
❌ AMBIGUOUS / OVERLAPPING (High Failure Rate)
├── modify_file(path, content)
├── update_file(path, newText)
└── write_file(path, data)

✅ ORTHOGONAL & DISTINCT (High Accuracy)
├── read_file_structure(path)      ➔ Inspect directory tree or AST
├── read_file_content(path, lines) ➔ Inspect specific line ranges
└── apply_file_diff(path, diff)    ➔ Apply deterministic unified patch
```

### The "Single Clear Verb" Rule
- Name tools using clear Action-Noun pairs: `get_order`, `cancel_order`, `export_csv`.
- Avoid vague tool names like `process_data`, `handle_stuff`, or `manage_user`.

---

## 🛑 5. Circuit Breakers & Anti-Looping Guards

Autonomous agents can get caught in a "doom loop"—calling the exact same failing tool with the exact same invalid arguments 10 times in a row.

### Server-Side Loop Detection (Circuit Breaker)
Track request hashes in the MCP session to detect repetitive calls:

```typescript
import crypto from "crypto";

// Map to track recent calls: sessionId -> { hash, count }
const callHistory = new Map<string, { hash: string; count: number }>();

function checkCircuitBreaker(sessionId: string, toolName: string, args: any): void {
  const hash = crypto.createHash("sha256").update(toolName + JSON.stringify(args)).digest("hex");
  const record = callHistory.get(sessionId);

  if (record && record.hash === hash) {
    record.count += 1;
    if (record.count >= 3) {
      throw new Error(
        `CIRCUIT BREAKER TRIGGERED: You have invoked tool '${toolName}' with identical arguments 3 times consecutively and failed. Halt and ask the user for clarification.`
      );
    }
  } else {
    callHistory.set(sessionId, { hash, count: 1 });
  }
}
```

---

## 📋 Production MCP Architecture Checklist

| Design Principle | Implementation Requirement |
| :--- | :--- |
| **Payload Budgeting** | Default limits on lists (≤ 50 items); truncate logs with line counters. |
| **Two-Phase Verification** | Provide `dry_run` or preview flags for state-altering operations. |
| **Self-Healing Errors** | Return `{ parameter, constraint, allowedValues, suggestion }` on failure. |
| **Tool Orthogonality** | Ensure each tool has a non-overlapping, distinct domain of responsibility. |
| **Idempotency** | Ensure safe retries by accepting client-side idempotency keys where applicable. |
| **Circuit Breakers** | Detect and break repetitive loop patterns before token budgets drain. |
