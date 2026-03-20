FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN DATABASE_URL=postgresql://dummy npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN DATABASE_URL=postgresql://dummy npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
