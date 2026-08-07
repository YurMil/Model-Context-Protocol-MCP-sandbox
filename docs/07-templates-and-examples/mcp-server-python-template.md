# Boilerplate Template: Python FastMCP Server

Complete starter boilerplate for creating Python MCP servers using `mcp` SDK or `FastMCP`.

---

## 📦 `pyproject.toml`

```toml
[project]
name = "py-mcp-server-template"
version = "0.1.0"
description = "FastMCP server template for sandbox testing"
dependencies = [
    "mcp[cli]>=1.0.0",
    "pydantic>=2.0.0",
    "httpx>=0.27.0"
]
requires-python = ">=3.10"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

---

## 🐍 `server.py`

```python
import sys
from mcp.server.fastmcp import FastMCP, Context
from pydantic import BaseModel, Field

# Initialize FastMCP Server
mcp = FastMCP(
    "PyMCP-Sandbox-Server",
    dependencies=["httpx", "pydantic"]
)

# 1. Define Input Model with Pydantic Validation
class CalculateDiscountRequest(BaseModel):
    original_price: float = Field(..., description="Original item price in USD", gt=0)
    discount_percentage: float = Field(..., description="Discount percentage between 0 and 100", ge=0, le=100)

# 2. Register Tool using Decorator
@mcp.tool()
async def calculate_discount(data: CalculateDiscountRequest) -> str:
    """Calculates final price after applying discount percentage."""
    discount_amount = data.original_price * (data.discount_percentage / 100.0)
    final_price = data.original_price - discount_amount
    return f"Original: ${data.original_price:.2f} | Discount: {data.discount_percentage}% | Final: ${final_price:.2f}"

# 3. Register Static Resource
@mcp.resource("config://app/settings")
def get_app_settings() -> str:
    """Exposes current server configuration settings."""
    return '{"environment": "sandbox", "debug": true, "max_connections": 10}'

# 4. Register Prompt Template
@mcp.prompt()
def summarize_incident(incident_id: str) -> str:
    """Generates prompt format for investigating system incident."""
    return f"System Incident Investigation for ID: {incident_id}\n\nPlease analyze recent logs and describe root cause."

if __name__ == "__main__":
    # Run using Standard I/O transport
    mcp.run(transport="stdio")
```

---

## 🚀 Execution & Inspection Commands

```bash
# Run using uv
uv run server.py

# Inspect using MCP Inspector
npx @modelcontextprotocol/inspector uv run server.py
```
