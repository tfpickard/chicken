# Chicken-as-a-Service - FastAPI Backend

A FastAPI backend for the world's premier chicken delivery platform.

## Requirements

- Python 3.14+
- pip

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message with available endpoints |
| `/chicken` | GET | Get 1000 chickens (space-separated) |
| `/chicken/{count}` | GET | Get N chickens (max 50,000) |
| `/chicken/json` | GET | Get chickens as JSON array |
| `/health` | GET | Health check (`{"status": "chicken"}`) |
| `/leaderboard` | GET | Top 10 chicken consumers |
| `/ascii/rave` | GET | ASCII animation frames |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
