# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json tsconfig.json ./

# Copy workspace packages
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Install all dependencies
RUN npm ci

# Build shared then web
RUN npm run build -w @ethos/shared
RUN npm run build -w @ethos/web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 8080

CMD ["node_modules/.bin/next", "start", "--prefix", "apps/web", "-p", "8080"]
