# build stage
FROM node:22.9 AS build
WORKDIR /app
COPY package*.json ./
COPY common/package*.json common/
COPY frontend/package*.json frontend/
RUN rm -rf node_modules package-lock.json && npm install
COPY common ./common
COPY frontend ./frontend
RUN npm run build:frontend

# production stage
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]