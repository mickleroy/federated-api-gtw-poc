# Build stage
FROM --platform=linux/arm64 node:18-slim AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy source code
COPY . .

# Compile TypeScript to JavaScript with increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM --platform=linux/arm64 node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/app.js"]