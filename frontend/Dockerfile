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

# Expose port 8080
EXPOSE 8080

# Start the development server with host binding and specific port
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "8080"]