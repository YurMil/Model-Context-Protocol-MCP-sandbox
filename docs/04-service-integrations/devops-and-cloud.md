# Service Integrations: DevOps, Docker & Cloud SDKs

MCP servers can manage local containers, cloud infrastructure, CI/CD pipelines, and version control systems directly on behalf of developer assistants.

---

## 🏗️ DevOps Tools Spectrum

| Integration | Primary Tools Exposed | Use Case |
| :--- | :--- | :--- |
| **Docker MCP** | `list_containers`, `inspect_logs`, `start_container` | Managing local containerized microservices |
| **Kubernetes MCP** | `get_pods`, `describe_deployment`, `tail_logs` | Troubleshooting k8s cluster workloads |
| **Git / GitHub MCP** | `create_pull_request`, `list_issues`, `commit_changes` | Autonomous pull request reviews and git automation |
| **AWS / GCP / Azure** | `query_cloudwatch`, `list_s3_buckets`, `get_metrics` | Cloud operational awareness and observability |

---

## 🔒 Security Best Practices for DevOps MCP Tools

1. **User Approval Prompts**: Operations that modify state (e.g. `delete_pod`, `push_code`, `drop_database`) MUST require explicit user confirmation in the MCP Host UI before execution.
2. **Sandbox Isolation**: Run Docker management tools inside isolated non-privileged contexts.
3. **Audit Logging**: Maintain append-only JSON logs of all executed shell and cloud SDK invocations.
