"""
ASCII art routes for chicken animations
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.chickens import ASCII_FRAMES, SCREAMING_CHICKEN

router = APIRouter()


@router.get("/ascii/rave")
async def get_rave_frames():
    """Get ASCII animation frames for the chicken rave"""
    return {
        "frames": ASCII_FRAMES,
        "screaming_chicken": SCREAMING_CHICKEN,
        "frame_count": len(ASCII_FRAMES),
        "recommended_fps": 4
    }
