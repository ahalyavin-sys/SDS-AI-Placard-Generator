# Multi-stage build: compile the Vite app, then serve the static dist/ with Nginx.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve the built static files.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/

# Expose port 8080 (Cloud Run's default expected port)
EXPOSE 8080

# Configure Nginx to listen on port 8080 instead of the default port 80
CMD ["/bin/sh", "-c", "sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
