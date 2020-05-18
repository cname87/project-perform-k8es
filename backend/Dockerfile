# Build the backend application

# Use a base node image from Docker hub
FROM node:13.12.0

# Set the image working directory
WORKDIR /backend

# Copy package.json & package.lock.json files
COPY package*.json ./

# Install without dev-dependencies
RUN npm install --only=production

# Copy rest of the application source code
COPY . ./

# Default to run in production mode
ENV NODE_ENV='production'

# TODO
# Running 'skaffold debug' will add --inspect=9229'
ENTRYPOINT ["node", "dist/src/app.js"]

# CMD ["npm", "run", "start"]
