"""
Leaderboard routes
"""

from fastapi import APIRouter

from app.core.leaderboard import get_top_consumers

router = APIRouter()


@router.get("/leaderboard")
async def get_leaderboard():
    """Get the top 10 chicken consumers"""
    return get_top_consumers(10)
