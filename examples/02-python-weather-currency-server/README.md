# Example 02: Python Weather & Currency FastMCP Server

A complete FastMCP Python server exposing real-time weather forecasts and currency conversion using **100% free public APIs** (Open-Meteo & Open Exchange Rates; no API key required).

---

## 📌 Features Exposed to LLMs

### Tools
- `get_current_weather({"latitude": 51.5074, "longitude": -0.1278})` — Fetches current weather (temperature, wind speed) from Open-Meteo API.
- `convert_currency({"from_curr": "USD", "to_curr": "EUR", "amount": 100})` — Converts currency using public exchange rates.

---

## 🚀 How to Run

### 1. Install `uv` (Fast Python Package Manager)
```bash
pip install uv
```

### 2. Run Server via `uv`
```bash
cd examples/02-python-weather-currency-server
uv run server.py
```

### 3. Inspect using MCP Inspector
```bash
npx @modelcontextprotocol/inspector uv run server.py
```
Open `http://localhost:5173` to test tool execution.

---

## 🤖 Client Setup

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "weather_currency": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "E:/My web projects/Model-Context-Protocol-MCP-sandbox/examples/02-python-weather-currency-server",
        "server.py"
      ]
    }
  }
}
```
