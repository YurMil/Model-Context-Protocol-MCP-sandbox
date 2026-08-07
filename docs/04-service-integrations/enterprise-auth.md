# Service Integrations: Enterprise Authentication & Key Management

Production MCP integrations require robust authentication, secret isolation, role-based access control (RBAC), and compliance auditing.

---

## 🔐 Key Architectural Principles

1. **Never Store Keys in Prompts**: API credentials must never be injected into standard system prompts or LLM context windows.
2. **Environment Variable Sanitation**: Expose API keys exclusively through server process environment variables (`process.env` / `os.environ`).
3. **OAuth2 Delegation Pass-Through**: For SSE/HTTP deployments, pass user authorization bearer tokens using HTTP headers (`Authorization: Bearer <token>`).

---

## 🔑 Authentication Patterns

```
┌─────────────────┐        Bearer Token / Header       ┌─────────────────┐
│   MCP Client    ├───────────────────────────────────►│  MCP Gateway /  │
└─────────────────┘                                    │  Reverse Proxy  │
                                                       └────────┬────────┘
                                                                │ Validate Token
                                                                ▼
                                                       ┌─────────────────┐
                                                       │ OAuth2 / Keycloak│
                                                       └─────────────────┘
```

---

## 🛡️ Secret Vault Integration Example (HashiCorp Vault / AWS Secrets Manager)

When initializing an MCP Server, retrieve secrets dynamically at startup rather than saving them in configuration files:

```typescript
// Fetching secrets dynamically at server boot
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

async function getDatabaseCredentials(): Promise<string> {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: "projects/my-project/secrets/db-password/versions/latest"
  });
  return version.payload?.data?.toString() || "";
}
```
