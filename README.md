# Chicken as a Service (CaaS)

A minimalist-yet-serious poultry platform delivering the word "chicken" in absurd quantities. Backend powered by FastAPI; frontend powered by SvelteKit.

## Project structure
- `backend/` — FastAPI app with chicken endpoints, ASCII rave frames, and an in-memory leaderboard.
- `frontend/` — SvelteKit landing page that animates ASCII chickens and blasts poultry text into a waterfall.
- `.gitignore` — Ignores Python caches, `node_modules`, build output, and SvelteKit artifacts.

## Backend (FastAPI)
Requirements: Python 3.14+ (works on 3.11+ in practice), `pip`.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Key endpoints:
- `GET /health` → `{ "status": "chicken" }`
- `GET /chicken` → 1,000 "chicken" words joined by spaces
- `GET /chicken/{count}` → configurable count capped at 50k; invalid numbers return `{ "cluck": "nope" }`
- `GET /chicken/json` → `{ "chickens": ["chicken", ...] }`
- `GET /ascii/rave` → JSON of ASCII frames plus frame duration (4 fps)
- `GET /leaderboard` → in-memory chicken counts by client IP

## Frontend (SvelteKit)
Requirements: Node 20+, npm.

```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```

- The brightest ANSI yellow background you can imagine.
- Giant central ASCII chicken animating at 4 fps.
- One button: **CHICKEN** — fetches `/chicken` and dumps 1,000 chickens into a scrollable div.
- Hidden Konami code reveals a mega ASCII chicken.
- Leaderboard shows which client asked for the most chickens (in-memory, refreshed after button click).
- Configure the backend URL with `VITE_API_BASE` (defaults to `http://localhost:8000`).

## Deluxe notes
- `/chicken/json` supplies an array of chickens for programmatic snackers.
- `/ascii/rave` frames are shared between frontend and backend for consistent vibes.
- The in-memory leaderboard resets when the backend restarts.

## Architectural choices
- **FastAPI** for simple, typed endpoints and easy streaming/text responses.
- **SvelteKit** for a lean SPA-style landing page with minimal dependencies and built-in animation cadence.
- **In-memory leaderboard** keeps the project dependency-free; swap for persistent storage if required.
- **CORS** is open to simplify local dev between ports 8000 (API) and 5173 (UI).

## Running in GitHub Codespaces or locally
1. Start the backend (port 8000).
2. Start the frontend (port 5173) and ensure it can reach the backend URL. Set `VITE_API_BASE` if the backend is forwarded under a different host/port.
3. Visit the frontend, click **CHICKEN**, and enjoy the poultry Niagara Falls.

### Docker Compose (backend + frontend)

If you prefer containers, build and run both services together:

```bash
docker compose up --build
```

The backend is served on `http://localhost:8000` and the frontend on `http://localhost:5173`, with `VITE_API_BASE` wired to the backend service inside the compose network.

## Next steps
- Add persistence for the leaderboard if chickens must survive restarts.
- Consider WebSocket/SSE streaming for `/ascii/rave` to push frames live.
