"""
Chicken routes - the core of our service
"""

from fastapi import APIRouter, Path, Request
from fastapi.responses import PlainTextResponse, JSONResponse

from app.core.chickens import generate_chickens, generate_chicken_list, MAX_CHICKENS
from app.core.leaderboard import record_request

router = APIRouter()


@router.get("/chicken", response_class=PlainTextResponse)
async def get_chickens(request: Request):
    """Get 1000 chickens (space-separated)"""
    client_ip = request.client.host if request.client else "unknown"
    record_request(client_ip, 1000)
    return generate_chickens(1000)


@router.get("/chicken/json")
async def get_chickens_json(request: Request):
    """Get chickens as a JSON array"""
    client_ip = request.client.host if request.client else "unknown"
    record_request(client_ip, 1000)
    return generate_chicken_list(1000)


@router.get("/chicken/{count}", response_class=PlainTextResponse)
async def get_chickens_count(
    request: Request,
    count: int = Path(..., ge=0, le=MAX_CHICKENS, description="Number of chickens to generate")
):
    """Get a specific number of chickens (max 50,000)"""
    client_ip = request.client.host if request.client else "unknown"
    record_request(client_ip, count)
    return generate_chickens(count)
