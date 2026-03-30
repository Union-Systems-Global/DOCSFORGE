# DocsForge Monorepo

A full-stack application with separate frontend and backend packages managed using Bun workspaces.

## Project Structure

```
docsforge-central/
├── frontend/          # React + Vite + TypeScript web application
├── backend/           # Node.js + Express API server
├── package.json       # Bun workspaces configuration
└── README.md         # This file
```

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed (v1.0+)
- Node.js 18+ (if not using Bun runtime)

### Installation

```bash
# Install dependencies for both frontend and backend
bun install
```

### Development

Run both frontend and backend in parallel with hot-reload:

```bash
# Run frontend + backend together
bun dev

# Or run them separately:
bun dev:frontend  # Frontend on http://localhost:3000
bun dev:backend   # Backend on http://localhost:3001
```

### Building for Production

```bash
# Build both frontend and backend
bun run build

# Or build individually:
bun run build:frontend  # Vite production build
bun run build:backend   # TypeScript compilation
```

### Testing

```bash
# Run all tests
bun test

# Run frontend tests only
bun run test:frontend

# Watch mode for frontend
bun run test:watch:frontend
```

### Linting

```bash
bun run lint
```

## Frontend

React application using Vite, shadcn/ui, and Tailwind CSS.

**Location:** `./frontend`  
**Port:** 3000  
**Technology:** React 18, TypeScript, Vite, shadcn/ui

### Frontend Commands
```bash
cd frontend
bun dev          # Start dev server
bun build        # Production build
bun test         # Run tests
bun lint         # Run linter
```

## Backend

Express.js API server with TypeScript support.

**Location:** `./backend`  
**Port:** 3001  
**Technology:** Node.js, Express, TypeScript

### Backend Commands
```bash
cd backend
bun dev              # Start dev server (with hot-reload)
bun build            # TypeScript compilation
bun start            # Run compiled JS
bun type-check       # Check TypeScript types
```

### Backend Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api` - Welcome endpoint with API information

### Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
PORT=3001
NODE_ENV=development
```

## Frontend-Backend Communication

The frontend is configured to proxy API requests to the backend:
- Frontend requests to `/api/*` are forwarded to `http://localhost:3001`
- This is configured in `frontend/vite.config.ts`

Example fetch in frontend:
```typescript
const response = await fetch('/api/health');
const data = await response.json();
```

## Scripts Summary

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Run frontend + backend in parallel |
| `bun dev:frontend` | Frontend development server only |
| `bun dev:backend` | Backend development server only |
| `bun build` | Build both frontend and backend |
| `bun build:frontend` | Build frontend only |
| `bun build:backend` | Build backend only |
| `bun test` | Run all tests |
| `bun test:frontend` | Frontend tests only |
| `bun test:watch:frontend` | Frontend tests in watch mode |
| `bun lint` | Lint frontend code |

## Deployment

### Frontend
Build the frontend and deploy the `frontend/dist/` directory to a static hosting service (Vercel, Netlify, etc.) or place it in a CDN.

### Backend
Build (`bun run build:backend`) and run the compiled code with `node dist/index.js` or containerize for deployment.

## Contributing

1. Make changes in either `frontend/` or `backend/`
2. Ensure tests pass: `bun test`
3. Ensure linting passes: `bun lint`
4. Commit and push changes

## License

MIT
