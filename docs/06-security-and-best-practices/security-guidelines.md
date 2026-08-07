# Security & Best Practices: Hardening MCP Servers

MCP servers execute code, interact with file systems, access database records, and invoke external network services based on LLM instruction. Hardening security is paramount.

---

## 🛡️ Top Threat Vectors & Mitigations

### 1. Indirect Prompt Injection
- **Threat**: Malicious data retrieved from a website, database, or external email contains instructions telling the LLM to execute dangerous tools (e.g. `delete_file`, `exfiltrate_keys`).
- **Mitigations**:
  - **Human-in-the-Loop Approval**: Mandate client-side user confirmation for mutating tools.
  - **Read-Only Enclosure**: Design default connections as read-only.
  - **Strict Tool Input Validation**: Reject input containing shell escape codes, path traversal symbols (`../`), or dangerous command strings.

### 2. Path Traversal & File System Escape
- **Threat**: LLM requests a resource URI like `file:///etc/passwd` or `file:///C:/Windows/System32`.
- **Mitigations**:
  - Enforce strict root path scoping using `path.resolve()` and `roots/list`. Reject any path resolve attempt outside allowed directory boundaries.

```typescript
import path from "path";

function validatePathWithinRoot(targetPath: string, allowedRoot: string): string {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedRoot = path.resolve(allowedRoot);

  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error(`Access Denied: Path '${targetPath}' escapes root boundary.`);
  }
  return resolvedTarget;
}
```

### 3. Arbitrary Code Execution
- **Threat**: Exposing python interpreters, shell execution (`eval`, `exec`), or SQL drop operations without sandboxing.
- **Mitigations**:
  - Run MCP servers inside unprivileged Docker containers or isolated WebAssembly runtimes.
  - Apply strict CPU/RAM timeout limits per tool call.
