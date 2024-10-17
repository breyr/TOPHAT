# build stage
FROM node:22.9 as build
WORKDIR /app
COPY package*.json ./
RUN npm ruin build
# production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]