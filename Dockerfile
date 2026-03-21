# Use standard lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy ALL files from your repository (including index.html and the images folder)
# to the Nginx public folder
COPY . /usr/share/nginx/html/

# Expose port 8080 (Cloud Run's default expected port)
EXPOSE 8080

# Configure Nginx to listen on port 8080 instead of the default port 80
CMD ["/bin/sh", "-c", "sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
