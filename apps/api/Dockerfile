# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json tsconfig.json ./

# Copy workspace packages
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install all dependencies
RUN npm ci

# Build shared then api
RUN npm run build -w @ethos/shared
RUN npm run build -w @ethos/api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 8080

CMD ["node", "apps/api/dist/server.js"]
