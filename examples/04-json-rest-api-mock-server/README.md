# Example 04: JSONPlaceholder REST API Connector (Python FastMCP)

A Python FastMCP server wrapping the public open REST API **JSONPlaceholder** (`https://jsonplaceholder.typicode.com`), allowing LLMs to fetch mock user profiles, posts, and comments.

---

## 📌 Features Exposed to LLMs

### Tools
- `get_user_profile({"user_id": 1})` — Fetches user profile data (name, email, company, address).
- `get_user_posts({"user_id": 1})` — Retrieves list of posts created by a specific user.
- `get_post_comments({"post_id": 1})` — Retrieves comments for a given post.
- `create_post_draft({"user_id": 1, "title": "...", "body": "..."})` — Simulates POST creation request.

---

## 🚀 How to Run

### 1. Run using `uv`
```bash
cd examples/04-json-rest-api-mock-server
uv run server.py
```

### 2. Test in Inspector
```bash
npx @modelcontextprotocol/inspector uv run server.py
```
Open `http://localhost:5173`.
