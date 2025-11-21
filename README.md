# Chicken-as-a-Service (CaaS)

> CaaC: Chicken as a CaaC - Enterprise-grade poultry delivery

A minimalist, absurdist SaaS platform whose sole purpose is to deliver the word "chicken" in increasingly ridiculous ways.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### GitHub Codespaces

1. Open the repository in GitHub Codespaces
2. Wait for the container to build
3. Run:
   ```bash
   npm install
   npm run dev -- --host
   ```
4. Click the "Open in Browser" button when the port notification appears

### Production Build

```bash
npm run build
npm run preview
# or
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chicken` | GET | Returns "chicken" repeated 1000 times |
| `/chicken/:count` | GET | Returns "chicken" repeated `count` times (max 50k) |
| `/chicken/json` | GET | Returns an array of chickens (query: `?count=N`) |
| `/ascii/rave` | GET | Returns ASCII chicken frames for animation |
| `/health` | GET | Always returns `{"status": "chicken"}` |
| `/leaderboard` | GET | Top 10 chicken requesters |

### Error Handling

If `/chicken/:count` receives a non-numeric value:
```json
{"cluck": "nope"}
```

## Frontend Features

- Giant animated ASCII chicken (4 fps)
- One button: **CHICKEN**
- Clicking dumps 1000 chickens into a scrollable div
- Background: The brightest ANSI yellow legally allowed (#FFFF00)
- Hidden Konami code (Up Up Down Down Left Right Left Right B A)

## Architecture

```
chicken/
├── src/
│   ├── app.css              # Global styles (MAXIMUM YELLOW)
│   ├── app.html             # HTML template
│   ├── lib/
│   │   ├── chickens.ts      # ASCII art & generation functions
│   │   ├── leaderboard.ts   # In-memory request tracking
│   │   └── index.ts         # Library exports
│   └── routes/
│       ├── +layout.svelte   # Root layout
│       ├── +page.svelte     # Landing page with animation
│       ├── chicken/
│       │   ├── +server.ts   # GET /chicken
│       │   ├── [count]/
│       │   │   └── +server.ts  # GET /chicken/:count
│       │   └── json/
│       │       └── +server.ts  # GET /chicken/json
│       ├── ascii/
│       │   └── rave/
│       │       └── +server.ts  # GET /ascii/rave
│       ├── health/
│       │   └── +server.ts   # GET /health
│       └── leaderboard/
│           └── +server.ts   # GET /leaderboard
├── static/                  # Static assets
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

### Design Decisions

1. **SvelteKit**: Single framework for both frontend and API routes, simplifying deployment and development.

2. **Node Adapter**: Production-ready adapter for standard Node.js hosting.

3. **In-Memory Leaderboard**: Simple Map-based storage that resets on restart. Perfect for an absurdist app that doesn't need persistence.

4. **ASCII Animation Client-Side**: The `/ascii/rave` endpoint returns all frames as JSON, letting the client handle animation. This is more efficient than server-side streaming for this use case.

5. **50k Chicken Cap**: Protects both server resources and the universe from chicken overflow.

## Testing the API

```bash
# Get 1000 chickens
curl http://localhost:5173/chicken

# Get 42 chickens
curl http://localhost:5173/chicken/42

# Get chickens as JSON
curl http://localhost:5173/chicken/json?count=10

# Check health
curl http://localhost:5173/health

# Get ASCII rave frames
curl http://localhost:5173/ascii/rave

# View leaderboard
curl http://localhost:5173/leaderboard

# Test error handling
curl http://localhost:5173/chicken/notanumber
# Returns: {"cluck":"nope"}
```

## License

MIT - Use responsibly. The chickens are watching.

---

*Enterprise Poultry Solutions since 2024*
