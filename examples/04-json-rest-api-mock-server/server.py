import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("JSONPlaceholderMockServer", dependencies=["httpx", "pydantic"])
BASE_URL = "https://jsonplaceholder.typicode.com"

class CreatePostRequest(BaseModel):
    user_id: int = Field(..., description="Numeric ID of user author", gt=0)
    title: str = Field(..., description="Post title text")
    body: str = Field(..., description="Post content body text")

@mcp.tool()
async def get_user_profile(user_id: int) -> str:
    """Fetches user profile details (Name, Email, Company) by numeric ID."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/users/{user_id}")
        if res.status_code == 404:
            return f"User ID {user_id} not found."
        return res.text

@mcp.tool()
async def get_user_posts(user_id: int) -> str:
    """Retrieves all blog posts published by user ID."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/posts?userId={user_id}")
        return res.text

@mcp.tool()
async def get_post_comments(post_id: int) -> str:
    """Retrieves comments for a specific post ID."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/posts/{post_id}/comments")
        return res.text

@mcp.tool()
async def create_post_draft(req: CreatePostRequest) -> str:
    """Sends POST request to create a mock blog post."""
    payload = {"userId": req.user_id, "title": req.title, "body": req.body}
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{BASE_URL}/posts", json=payload)
        return f"Mock Post Created! Response: {res.text}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
