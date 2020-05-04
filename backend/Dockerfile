
FROM node:latest

WORKDIR /backend

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application source code
COPY . .

# Run app.js with debugging port when container launches
ENTRYPOINT ["node", "--inspect=9229", "app.js"]

# Run app.js without debugger port when container launches
# ENTRYPOINT ["node", "app.js"]
