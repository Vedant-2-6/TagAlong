# TagAlong — Unified Production Dockerfile
# Multi-stage build: builds React frontend + runs Node.js backend
# Usage:
#   docker build -t tagalong .
#   docker run -p 5000:5000 --env-file backend/.env tagalong

# ─── Stage 1: Build the React frontend ───
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Production backend + built frontend ───
FROM node:20-alpine
WORKDIR /app

# Copy backend package files and install production deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/src ./src
COPY backend/.env ./.env

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:5000/api/users',(r)=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

# Start the server
CMD ["node", "src/app.js"]
