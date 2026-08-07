# MCP Prompts Primitive

Prompts allow MCP Servers to expose reusable prompt templates, workflows, and slash commands directly to the client application.

---

## 📝 Prompt Listing (`prompts/list`)

```json
{
  "prompts": [
    {
      "name": "git_commit_summarizer",
      "description": "Summarizes git diffs into conventional commit message format",
      "arguments": [
        {
          "name": "diff_text",
          "description": "Git diff content",
          "required": true
        }
      ]
    }
  ]
}
```

---

## ⚡ Fetching Prompts (`prompts/get`)

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "prompts/get",
  "params": {
    "name": "git_commit_summarizer",
    "arguments": {
      "diff_text": "diff --git a/src/main.ts b/src/main.ts..."
    }
  }
}
```

Response format returns a structured message array suitable for sending directly to an LLM:

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "result": {
    "description": "Summarize git diff into conventional commit",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "Please summarize the following git diff into a conventional commit message:\n\ndiff --git a/src/main.ts..."
        }
      }
    ]
  }
}
```
