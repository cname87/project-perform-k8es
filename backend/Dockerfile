# Build the backend application

# Use a base node image from Docker hub
FROM node:14-alpine3.12

# Set the image working directory
WORKDIR /backend

# Copy package.json & package.lock.json files
COPY package*.json ./

# Install without dev-dependencies
RUN npm install --only=production

# Copy rest of the application source code
COPY . ./

# Run with '--inspect=9229' if running 'DeBug Backend on Kubernetes'
# ENTRYPOINT ["node", "--inspect=9229", "dist/src/app.js"]
ENTRYPOINT ["node", "dist/src/app.js"]
