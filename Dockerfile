# Multi-stage Dockerfile for Next.js app with Prisma
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy lockfiles and install deps (use frozen lockfile for reproducible builds)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install pnpm so we can run production commands
RUN npm install -g pnpm@8

# Copy built artifacts and production deps from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Ensure Prisma client is generated and migrations are applied on container start
CMD ["sh", "-lc", "pnpm prisma generate && pnpm prisma migrate deploy || true && pnpm start"]
