from __future__ import annotations

import itertools
from collections import defaultdict
from typing import Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

app = FastAPI(title="Chicken as a Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_CHICKENS = 50_000
DEFAULT_CHICKENS = 1_000

CHICKEN_WORD = "chicken"

# Roughly 8+ frames of ASCII chicken goodness.
ASCII_CHICKEN_FRAMES: List[str] = [
    r"""
   _
 ('<
 / )
  |\
""".strip("\n"),
    r"""
   _
 (>")
 / )
  |\
""".strip("\n"),
    r"""
   _
 ("<)
 / )
  |\
""".strip("\n"),
    r"""
   _
 (v")
 / )
  |\
""".strip("\n"),
    r"""
   _
 (^^)
 / )
  |\
""".strip("\n"),
    r"""
   _
 (^v)
 / )
  |\
""".strip("\n"),
    r"""
   _
 (Ov)
 / )
  |\
""".strip("\n"),
    r"""
   _
 (vO)
 / )
  |\
""".strip("\n"),
]

leaderboard: Dict[str, int] = defaultdict(int)


def _add_to_leaderboard(request: Request, chicken_count: int) -> None:
    client_id = request.client.host if request.client else "unknown"
    leaderboard[client_id] += chicken_count


def _limit_count(count: int) -> int:
    return min(count, MAX_CHICKENS)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": CHICKEN_WORD}


@app.get("/chicken", response_class=PlainTextResponse)
def chicken(request: Request) -> str:
    _add_to_leaderboard(request, DEFAULT_CHICKENS)
    return " ".join(itertools.repeat(CHICKEN_WORD, DEFAULT_CHICKENS))


@app.get("/chicken/{count}", response_class=PlainTextResponse)
def chicken_count(count: str, request: Request):
    try:
        numeric_count = int(count)
    except ValueError:
        return JSONResponse(status_code=400, content={"cluck": "nope"})

    limited = _limit_count(max(0, numeric_count))
    _add_to_leaderboard(request, limited)
    return " ".join(itertools.repeat(CHICKEN_WORD, limited))


@app.get("/chicken/json")
def chicken_json(request: Request) -> Dict[str, List[str]]:
    _add_to_leaderboard(request, DEFAULT_CHICKENS)
    return {"chickens": [CHICKEN_WORD for _ in range(DEFAULT_CHICKENS)]}


@app.get("/ascii/rave")
def ascii_rave() -> Dict[str, object]:
    return {
        "frames": ASCII_CHICKEN_FRAMES,
        "frameDurationMs": 250,  # 4 frames per second for rave compliance.
    }


@app.get("/leaderboard")
def leaderboard_view() -> Dict[str, object]:
    sorted_entries = sorted(leaderboard.items(), key=lambda kv: kv[1], reverse=True)
    return {
        "leaders": [{"client": client, "chickens": count} for client, count in sorted_entries]
    }
