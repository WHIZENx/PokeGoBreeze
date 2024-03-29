# build environment
FROM node:18.17-alpine as builder
WORKDIR /app
COPY . .
RUN npm install --location=global npm@latest
RUN npm install && npm run build

# production environment
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]