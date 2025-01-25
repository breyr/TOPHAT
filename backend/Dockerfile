FROM node:22.9-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY common/package*.json common/
COPY backend/package*.json backend/
COPY backend/prisma ./backend/prisma

WORKDIR /app/backend
RUN npm ci
RUN npx prisma generate

WORKDIR /app
COPY common ./common
COPY backend ./backend
RUN npm run build:backend

FROM node:22.9-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/server.js"]