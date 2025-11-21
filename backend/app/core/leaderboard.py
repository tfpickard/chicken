"""
In-memory leaderboard for tracking chicken consumption
"""

from collections import defaultdict

# In-memory storage (resets on server restart)
_leaderboard: dict[str, int] = defaultdict(int)


def record_request(client_id: str, chicken_count: int) -> None:
    """Record a chicken request for a client"""
    _leaderboard[client_id] += chicken_count


def get_top_consumers(limit: int = 10) -> list[dict]:
    """Get the top chicken consumers"""
    sorted_consumers = sorted(
        _leaderboard.items(),
        key=lambda x: x[1],
        reverse=True
    )[:limit]

    return [
        {"client": client, "chickens": count, "rank": idx + 1}
        for idx, (client, count) in enumerate(sorted_consumers)
    ]


def reset_leaderboard() -> None:
    """Reset the leaderboard (for testing)"""
    _leaderboard.clear()
