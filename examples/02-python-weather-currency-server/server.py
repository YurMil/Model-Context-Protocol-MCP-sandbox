import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# Initialize FastMCP Server
mcp = FastMCP(
    "PublicWeatherCurrencyServer",
    dependencies=["httpx", "pydantic"]
)

class WeatherRequest(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate (e.g. 51.5074 for London)")
    longitude: float = Field(..., description="Longitude coordinate (e.g. -0.1278 for London)")

class CurrencyRequest(BaseModel):
    from_curr: str = Field(..., description="3-letter currency code to convert from (e.g. USD, EUR, GBP)")
    to_curr: str = Field(..., description="3-letter currency code to convert to (e.g. EUR, JPY, CAD)")
    amount: float = Field(..., description="Amount of money to convert", gt=0)

@mcp.tool()
async def get_current_weather(req: WeatherRequest) -> str:
    """Fetches real-time current weather metrics from Open-Meteo free API."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={req.latitude}&longitude={req.longitude}&current_weather=true"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        if res.status_code != 200:
            return f"Error: Weather API returned status {res.status_code}"
        data = res.json()
        current = data.get("current_weather", {})
        temp = current.get("temperature")
        windspeed = current.get("windspeed")
        return f"Location ({req.latitude}, {req.longitude}): Temperature = {temp}°C, Wind Speed = {windspeed} km/h"

@mcp.tool()
async def convert_currency(req: CurrencyRequest) -> str:
    """Converts currency using public open exchange rates API."""
    base = req.from_curr.upper()
    target = req.to_curr.upper()
    url = f"https://open.er-api.com/v6/latest/{base}"
    
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        if res.status_code != 200:
            return f"Error: Currency API returned status {res.status_code}"
        data = res.json()
        rates = data.get("rates", {})
        if target not in rates:
            return f"Error: Currency code '{target}' not supported."
        
        rate = rates[target]
        converted = req.amount * rate
        return f"{req.amount:.2f} {base} = {converted:.2f} {target} (Exchange Rate: 1 {base} = {rate:.4f} {target})"

if __name__ == "__main__":
    import os
    transport = os.getenv("MCP_TRANSPORT", "stdio")
    port = int(os.getenv("PORT", "8000"))
    if transport == "sse":
        mcp.run(transport="sse", host="0.0.0.0", port=port)
    else:
        mcp.run(transport="stdio")
