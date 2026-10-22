# build environment
FROM node:24.22.1-alpine AS builder
WORKDIR /app

# Install Python, bash, and build dependencies
RUN apk add --no-cache python3 make g++ gcc curl bash
RUN npm install --global npm@12.2.1

# Create build directory explicitly
RUN mkdir -p /app/dist

COPY . .
RUN npm ci && npm run deploy


# production environment
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
