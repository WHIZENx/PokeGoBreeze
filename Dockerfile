# build environment
FROM node:18.17.0-alpine as builder
WORKDIR /app

# Install Python, bash, and build dependencies
RUN apk add --no-cache python3 make g++ gcc curl bash

# Create build directory explicitly
RUN mkdir -p /app/dist

COPY . .
RUN npm install --location=global npm@10.8.2

# Try to run the build, but continue even if it fails
RUN npm install && npm run deploy


# production environment
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]