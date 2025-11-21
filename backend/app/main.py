"""
Chicken-as-a-Service FastAPI Backend
Python 3.14 compatible
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chicken, health, leaderboard, ascii_art

app = FastAPI(
    title="Chicken-as-a-Service API",
    description="The world's premier chicken delivery platform",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chicken.router, tags=["chicken"])
app.include_router(health.router, tags=["health"])
app.include_router(leaderboard.router, tags=["leaderboard"])
app.include_router(ascii_art.router, tags=["ascii"])


@app.get("/")
async def root():
    return {"message": "Welcome to Chicken-as-a-Service!", "endpoints": ["/chicken", "/chicken/{count}", "/chicken/json", "/health", "/leaderboard", "/ascii/rave"]}
