# MCP Resources Primitive

Resources provide a standard way for MCP Servers to expose passive data documents, state logs, or context files to MCP Host applications.

---

## 📄 Static vs Dynamic Resources

1. **Static Resources**: Known URIs advertised via `resources/list`.
   ```json
   {
     "resources": [
       {
         "uri": "postgres://database/schema",
         "name": "Database Schema",
         "description": "SQL schema structure for main database",
         "mimeType": "application/sql"
       }
     ]
   }
   ```
2. **Resource Templates**: URI patterns advertised via `resources/templates/list` for parameterized dynamic resources.
   ```json
   {
     "resourceTemplates": [
       {
         "uriTemplate": "file:///logs/{date}.log",
         "name": "Daily Log File",
         "mimeType": "text/plain"
       }
     ]
   }
   ```

---

## 📖 Reading Resources (`resources/read`)

Client requests resource data using its URI:

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "resources/read",
  "params": {
    "uri": "file:///logs/2026-08-07.log"
  }
}
```

Response format:
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "result": {
    "contents": [
      {
        "uri": "file:///logs/2026-08-07.log",
        "mimeType": "text/plain",
        "text": "2026-08-07 08:00:00 [INFO] Server started successfully."
      }
    ]
  }
}
```

---

## 🔔 Subscribing to Resource Updates

Clients can subscribe to resource changes via `resources/subscribe`:
When the resource changes, server emits `notifications/resources/updated`:
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": {
    "uri": "file:///logs/2026-08-07.log"
  }
}
```
