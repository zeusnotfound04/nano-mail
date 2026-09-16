# Next.js + Prisma frontend
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# pnpm version comes from "packageManager" in package.json
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# placeholder so `prisma generate` (run inside `next build`) doesn't fail
# for lack of DATABASE_URL at build time — real value is injected at runtime
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
# Run Next directly: the runner must not need corepack/pnpm (which downloads
# from the npm registry at startup) or any network access to boot.
CMD ["node_modules/.bin/next", "start"]
