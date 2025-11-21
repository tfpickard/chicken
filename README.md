# Chicken as a Service (CaaS)

A very serious enterprise platform that serves the word "chicken" in increasingly ridiculous ways. Backend is Express; frontend is a single-page static experience drenched in ANSI yellow.

## Endpoints

- `GET /health` → `{ "status": "chicken" }`
- `GET /chicken` → 1,000 chickens separated by spaces.
- `GET /chicken/json` → Array of 1,000 chickens.
- `GET /chicken/:count` → `count` chickens (capped at 50,000). Non-numeric count returns `{ cluck: "nope" }`.
- `GET /ascii/rave` → JSON payload of ASCII frames plus `fps` so the UI can animate.
- `GET /leaderboard` → Simple in-memory ranking of who has requested the most chickens.

## Frontend features

- Brightest possible yellow background.
- Title "chicken" and subtitle "CaaC: Chicken as a CaaC".
- Central ASCII chicken that animates at 4 fps.
- Single button labeled "CHICKEN" that floods a scrollable div with 1,000 chickens by calling `/chicken`.
- Hidden Konami code that reveals a giant screaming chicken.

## Running locally

```bash
npm install
npm run start
```

Then open http://localhost:5173/

## Notes

- The leaderboard is in-memory only; restarting the server will reset counts.
- Background animation frames are shared between backend and frontend via `/ascii/rave` so they stay in sync.
- Designed to run in GitHub Codespaces or any Node 18+ environment.

## Architectural choices

- **Express** keeps the backend tiny and transparent while meeting the API spec.
- **Static frontend** keeps deployment dead simple—no build step, just `npm start`.
- **JSON-driven animation** avoids server-sent events while still hitting the "rave" requirement.
