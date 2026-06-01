# Ethos — Architecture

## Overview

Ethos is a real-time chat application. It is a monorepo (`npm workspaces`) with three packages:

- `@ethos/web` — Next.js 15 frontend (App Router)
- `@ethos/api` — Express API + WebSocket server
- `@ethos/shared` — shared TypeScript types and constants

The frontend and API are deployed as separate Docker containers on AWS ECS (EC2 launch type) behind an Application Load Balancer. The database is hosted on Neon (managed Postgres). Sessions are stored in Upstash (managed Redis).

```
Browser
  ├── HTTPS → ALB → Next.js (ethos.fralinev.dev)
  └── WSS   → ALB → Express API (api.ethos.fralinev.dev)

Next.js (BFF)
  └── HTTP → Express API (api.ethos.fralinev.dev)

Express API
  ├── Neon (Postgres)
  ├── Upstash (Redis) — session store
  └── S3 (ethos-avatars) — avatar storage
```

---

## Monorepo Structure

```
ethos/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express API
└── packages/
    └── shared/       # Shared types and constants
```

---

## Frontend (apps/web)

### Pattern: BFF (Backend for Frontend)

The Next.js app acts as a BFF — the browser never talks directly to the Express API. All requests go through Next.js API route handlers (`app/api/...`), which:

1. Validate the session (read + unsign cookie, look up Redis)
2. Forward the request to the Express API with the cookie header
3. Return the response to the browser

This is necessary because the Express API is on a different subdomain (`api.ethos.fralinev.dev`) and the browser cannot forward the session cookie cross-origin.

### Server Components

The home page (`app/home/page.tsx`) is a server component that:
- Validates the session on the server
- Fetches initial data (current user, chats, users) in parallel via `Promise.all`
- Passes data to client components as props (seeding React Query's initial cache)

### Client State

| Concern | Tool |
|---|---|
| Server data (chats, users, profile) | TanStack Query v5 |
| Current user | React Context (`UserContext`) |
| Chat loading state | Redux (`chatSlice`) |
| UI state (modals, tabs) | `useState` |

### React Query

- `useQuery` for reads: `["chats"]`, `["users"]`, `["profile"]`
- `useMutation` for writes: profile save, chat rename
- Socket events update the cache directly via `queryClient.setQueryData`
- Server-fetched data is passed as `initialData` to avoid loading flash on first render

### WebSocket Client

A singleton `SocketClient` class (`hooks/useSocket.ts`) manages the WebSocket connection. It:
- Connects once and is shared across all components via a module-level singleton
- Handles reconnection with exponential backoff (max 15s)
- Joins a chat room on `auth:ready` via `chat:join`
- Exposes `onMessage`, `onOpen`, `onClose`, `onError` handler registration

### Next.js API Routes (BFF layer)

```
/api/auth/login         POST  → POST /auth/login
/api/auth/signup        POST  → POST /auth/signup
/api/auth/logout        POST  → POST /auth/logout
/api/users              GET   → GET /users
/api/chats/create       POST  → POST /chats/create
/api/chats/[chatId]     GET   → GET /chats/:chatId
                        PATCH → PATCH /chats/:chatId
/api/chats/[chatId]/messages  GET  → GET /chats/:chatId/messages
                              POST → POST /chats/:chatId/messages
/api/chats/[chatId]/members   DELETE → DELETE /chats/:chatId/members
/api/profiles           GET   → GET /profiles/:userId
                        POST  → POST /profiles
/api/profiles/avatar    POST  → POST /profiles/avatar
/api/health             GET   → GET /health
```

---

## API (apps/api)

### Structure

```
src/
├── routes/       # Express routers (thin — validate, call service, respond)
├── services/     # Business logic
├── repos/        # SQL queries
├── ws/           # WebSocket server and hub
├── utils/        # S3 upload
├── types/        # Internal TypeScript types
└── db/
    └── migrations/
```

### Express API Routes

```
POST   /auth/login
POST   /auth/signup
POST   /auth/logout

GET    /users                     # users who share a chat with requester (paginated, searchable)
GET    /users/me                  # current user

GET    /profiles/:userId
POST   /profiles
POST   /profiles/avatar           # multipart upload → S3

GET    /chats                     # all chats for requester
POST   /chats/create
GET    /chats/:chatId
PATCH  /chats/:chatId             # rename subject
GET    /chats/:chatId/messages
POST   /chats/:chatId/messages
DELETE /chats/:chatId/members     # leave chat

GET    /health
```

### WebSocket Server

The WS server runs alongside Express on the same port. Authentication happens on connection — the session cookie is validated before the socket is registered.

After auth, the server sends `auth:ready`. The client responds with `chat:join` to subscribe to a chat room.

**WebSocket message types (server → client):**

| Type | Trigger |
|---|---|
| `auth:ready` | Connection authenticated |
| `chat:created` | New chat created |
| `chat:renamed` | Chat subject updated |
| `chat:left` | User left a chat |
| `message:created` | New message posted |
| `user:login` | User logged in |

The hub (`ws/hub.ts`) maintains two maps:
- `userSockets` — userId → Set of WebSockets (for broadcasting to a user across devices)
- `chatSockets` — chatId → Set of WebSockets (for broadcasting to chat room members)

---

## Data Models

### users
```sql
id             bigserial primary key
username       text not null unique
password_hash  text not null
role           text not null default 'user'
email          text
is_active      boolean not null default true
created_at     timestamptz
updated_at     timestamptz
last_login_at  timestamptz
```

### profiles
```sql
user_id   bigint primary key references users(id)
full_name text
avatar_url text                   -- stored in S3, URL saved here
bio       text
created_at timestamptz
updated_at timestamptz
```

### chats
```sql
id          bigserial primary key
subject     text
type        text check (type in ('direct', 'group'))
created_by  bigint references users(id)
user_a_id   uuid                  -- for direct chat uniqueness constraint
user_b_id   uuid
archived_at timestamptz
created_at  timestamptz
```

### chat_members
```sql
chat_id   bigint references chats(id)
user_id   bigint references users(id)
joined_at timestamptz
primary key (chat_id, user_id)
```

### messages
```sql
id         bigserial primary key
chat_id    bigint references chats(id)
sender_id  bigint references users(id)
content    text not null
created_at timestamptz
```

---

## Auth Flow

1. User submits login form → `POST /api/auth/login` (Next.js BFF)
2. BFF forwards to `POST /auth/login` (Express API)
3. Express validates credentials, calls `req.session.userId = user.id`
4. express-session saves `{ userId }` to Redis, returns `Set-Cookie: connect.sid=<signed-session-id>`
5. Cookie is set with `domain: ".ethos.fralinev.dev"`, shared across subdomains
6. On subsequent requests: browser sends cookie → express-session looks up Redis → `req.session.userId` is populated

### Server-side session validation (Next.js)

Because Next.js and the Express API are separate processes, Next.js manually replicates the session lookup:
1. Read `connect.sid` cookie from request
2. Unsign it using `SESSION_SECRET`
3. Look up the session ID in Redis
4. Return `{ userId }` if found

---

## Infrastructure

| Service | Provider |
|---|---|
| Frontend container | AWS ECS (EC2, t3.small) |
| API container | AWS ECS (EC2, t3.small) |
| Load balancer | AWS ALB |
| Database | Neon (managed Postgres) |
| Session store | Upstash (managed Redis) |
| Avatar storage | AWS S3 (`ethos-avatars`) |
| Container registry | AWS ECR |
| DNS | ethos.fralinev.dev / api.ethos.fralinev.dev |

### Deployment

CI/CD via GitHub Actions. On push to `main`:
1. Build Docker images
2. Push to ECR
3. Force new ECS deployment

AMIs use Amazon Linux 2023 (ECS-optimized).

---

## Shared Package (@ethos/shared)

Contains TypeScript types shared between web and api:
- `User`, `Chat`, `ChatDTO`, `Profile`, `SessionData`, `Message`, `MessageDTO`
- `SocketEventMap`, `SocketMessage`
- `AUTH_ERRORS` constants
- `HttpError`, `BadRequestError`
