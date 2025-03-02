# build stage
FROM node:22.9 AS build
WORKDIR /app

# copy root package.json and lock file
COPY package*.json ./

# copy workspace package.json files
COPY common/package*.json common/
COPY frontend/package*.json frontend/

# install dependencies for all workspaces
RUN npm install

# copy the rest of the files
COPY common ./common
COPY frontend ./frontend

# build the frontend
RUN npm run build:frontend

# production stage
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]