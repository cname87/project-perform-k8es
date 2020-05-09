# Create an image wth nginx to act as a reverse proxy and serve static files.

# Use base nginx 1.18 image from Docker hub
FROM nginx:1.18


WORKDIR /

# Copy the nginx server configuration
COPY ./nginx-server.conf /etc/nginx/conf.d/default.conf

# Copy the files to be served by the nginx reverse proxy
COPY ./dist /usr/share/www/

# nginx starts when the image is run
