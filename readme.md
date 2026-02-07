# Ethos

Ethos is a robust, secure, full-stack chat app serving as a portfolio project.

## Features

- Authenticated httpOnly cookie sessions
- Backend-for-Frontend (Next.js API routes)
- Express REST API
- Redis session store
- PostgreSQL database
- Real-time messaging with WebSockets
- Optimistic UI updates
- SSR-compatible authentication
- Shared TypeScript types/utilities
- Production deployment ready

### Next.js (apps/web)
- UI rendering (SSR + client components)
- Authentication cookie handling
- Backend-for-Frontend routes
- Server-side data fetching
- WebSocket client

### Express (apps/api)
- Business logic
- REST endpoints
- Session validation
- Database queries
- WebSocket hub + broadcasting

### Redis
- Session storage
- Caching

### Postgres
- Users
- Chats
- Members
- Messages

## Tech Stack

Frontend
- Next.js 14
- React
- TypeScript

Backend
- Node.js
- Express
- Neon PostgreSQL
- Upstash Redis
- Native WebSockets

## Monorepo Structure

ethos/
  apps/
    web/        # Next.js app (UI + BFF)
    api/        # Express server
  packages/
    shared/     # Shared types + utilities

## Local Development

npm install

npm run dev --workspace web
npm run dev --workspace api

## Deployment

Hosted on Render:

- ethos-web (Next.js) ethos.fralinev.dev
- ethos-api (Express) api.ethos.fralinev.dev