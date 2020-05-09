# Build the backend application

# Use base node 13 image from Docker hub
FROM node:14

# Set the image working directory
WORKDIR /backend

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application source code
COPY . .

# Run app.js with debugging port when container launches
ENTRYPOINT ["node", "--inspect=9229", "dist/src/index.js"]

# Run app.js without debugger port when container launches
# ENTRYPOINT ["node", "dist/src/index.js"]
