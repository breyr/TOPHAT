FROM node:22.9-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY ../common ./common
RUN npm install
RUN npm install prisma --save-dev
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22.9-alpine as runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/common ./common
EXPOSE 3000
CMD ["node", "dist/server.js"]