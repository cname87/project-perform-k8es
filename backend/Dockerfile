# Build the backend application

# Use base node 13 image from Docker hub
FROM node:14

# Set the image working directory
WORKDIR /backend

# Copy package.json files and install dependencies
COPY package*.json ./

# Install with or without dev-dependencies
# RUN npm install
RUN npm install --production

# Copy rest of the application source code
COPY . .

# Run app.js with or without debugging port when container launches
ENTRYPOINT ["node", "--inspect=9229", "dist/src/index.js"]
# ENTRYPOINT ["node", "dist/src/index.js"]
