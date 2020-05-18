# Create an image wth nginx to act as a reverse proxy and serve static files.

# Use base nginx 1.18 image from Docker hub
FROM nginx:1.18


WORKDIR /

# Copy the nginx server configuration
COPY ./nginx-server.conf /etc/nginx/conf.d/default.conf

# Copy the files to be served by the nginx reverse proxy
COPY ./dist /usr/share/www/

# Note: The nginx default command is CMD ["nginx", "-g", "daemon off;"]
# This runs nginx in the foreground - suitable for a Docker container
