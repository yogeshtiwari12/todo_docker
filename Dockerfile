# Multi-stage Dockerfile for Railway-ready Next.js app with Prisma
FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["sh", "-lc", "node_modules/.bin/next start -p ${PORT:-3000}"]
