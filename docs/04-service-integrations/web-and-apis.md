# Service Integrations: Web Services, REST & Browser Automation

Exposing REST APIs, GraphQL, and Web Scraping / Playwright browser controls as MCP servers expands an LLM's reach to real-time live web data.

---

## 🌐 Web Integration Architectures

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   MCP Server    ├──────►│ REST / GraphQL  ├──────►│ Remote SaaS /   │
│   (Web Gateway) │       │ HTTP Client     │       │ External API    │
└────────┬────────┘       └─────────────────┘       └─────────────────┘
         │
         │                ┌─────────────────┐       ┌─────────────────┐
         └───────────────►│ Playwright /    ├──────►│ Web Pages /     │
                          │ Headless Chrome │       │ Web Interfaces  │
                          └─────────────────┘       └─────────────────┘
```

---

## 🛠️ Playwright Browser Automation MCP Pattern

Exposing headless browser scraping safely:

- **Tools**:
  - `navigate_page({"url": "https://example.com"})`
  - `take_screenshot({"fullPage": true})`
  - `extract_markdown({"selector": "main"})`

### Example Implementation (Python / Playwright)

```python
from mcp.server.fastmcp import FastMCP
from playwright.async_api import async_playwright

mcp = FastMCP("WebScraperSandbox")

@mcp.tool()
async def fetch_web_page_markdown(url: str) -> str:
    """Navigates to URL and converts HTML main content to clean text."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle")
        content = await page.inner_text("body")
        await browser.close()
        return content[:8000] # Return first 8000 chars to fit context
```

---

## ⚡ Generic REST API Wrapper Pattern

Convert OpenAPI / Swagger schemas directly into MCP Tool definitions using automated dynamic wrappers (e.g., `open-api-mcp-server`).
