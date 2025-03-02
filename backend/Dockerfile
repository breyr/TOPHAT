FROM node:22.9-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY common/package*.json common/
COPY backend/package*.json backend/
COPY backend/prisma ./backend/prisma

# install dependencies for all workspaces
RUN npm ci

WORKDIR /app/backend
RUN npx prisma generate

WORKDIR /app
COPY common ./common
COPY backend ./backend
RUN npm run build:backend

FROM node:22.9-alpine AS runtime
WORKDIR /app
# copy all node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/common ./common

EXPOSE 3000
CMD ["node", "dist/server.js"]