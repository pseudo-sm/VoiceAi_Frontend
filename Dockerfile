# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React app (Vite outputs to "dist")
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Azure App Service uses PORT environment variable (defaults to 80)
ENV PORT=80

# Expose the port
EXPOSE 80

# Use serve to serve the static files, using PORT env variable for Azure App Service
CMD ["sh", "-c", "serve -s dist -l ${PORT:-80}"]


