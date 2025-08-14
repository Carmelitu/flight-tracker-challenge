# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock (since the project uses yarn)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose port 5001
EXPOSE 5001

# Start the application
CMD ["yarn", "start"]