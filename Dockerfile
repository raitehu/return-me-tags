# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies and build the Next.js application
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime stage
FROM nginx:alpine AS runner

# Copy the statically exported site into nginx's web root
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
