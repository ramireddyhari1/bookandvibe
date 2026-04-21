FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2. Generate Prisma Client
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Add prisma to path for migrations
ENV PATH /app/node_modules/.bin:$PATH

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

# Sync schema and start the server
CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
