# Chicken-as-a-Service Deployment Guide

This guide covers three deployment methods for the Chicken-as-a-Service application.

## Architecture

This project consists of two components:
- **Frontend**: SvelteKit application with built-in API routes
- **Backend**: FastAPI Python application (optional, provides alternative API implementation)

## Deployment Options

### 1. Local Development

Run the frontend locally for development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

For backend development (optional):

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the backend
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### 2. Docker Compose Deployment

Deploy both frontend and backend using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

To stop the services:

```bash
docker-compose down
```

### 3. Vercel Deployment

#### Frontend Deployment

The frontend is configured to automatically deploy to Vercel:

1. **Connect your repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect SvelteKit

2. **Manual deployment** (if needed):
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

The `vercel.json` configuration and `svelte.config.js` are already set up to:
- Automatically use `@sveltejs/adapter-vercel` when deploying to Vercel
- Use `@sveltejs/adapter-node` for local and Docker deployments

#### Backend Deployment (Optional)

To deploy the FastAPI backend to Vercel as a separate project:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Deploy using Vercel CLI**:
   ```bash
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard if needed

Note: The backend `vercel.json` is configured to use `@vercel/python` runtime.

## Configuration Files

### Frontend (`/vercel.json`)
- Configures SvelteKit build for Vercel
- Sets deployment region
- Excludes backend from frontend deployment

### Backend (`/backend/vercel.json`)
- Configures Python FastAPI for serverless deployment
- Routes all requests to the main FastAPI app
- Sets Python-specific environment variables

### SvelteKit Adapter (`/svelte.config.js`)
- Automatically switches between Vercel and Node adapters
- Uses `process.env.VERCEL` to detect deployment platform

## Environment-Specific Builds

```bash
# Build for Vercel deployment
npm run build:vercel

# Build for Node/Docker deployment
npm run build:node

# Standard build (uses current environment)
npm run build
```

## Health Checks

Both frontend and backend include health check endpoints:

- Frontend: `GET /health` → `{ "status": "chicken" }`
- Backend: `GET /health` → `{ "status": "healthy" }`

## Notes

- The frontend includes its own API implementation, so it can run independently without the backend
- The backend provides an alternative API implementation for flexibility
- Docker Compose runs both services together for full-stack development
- Vercel deployments can be done separately for frontend and backend
- All deployment methods maintain the same API interface
