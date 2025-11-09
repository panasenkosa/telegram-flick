# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code and prisma
COPY . .

# Generate Prisma Client (with retries handled by Prisma)
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
RUN pnpm db:generate || pnpm db:generate || pnpm db:generate

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Copy prisma schema
COPY prisma ./prisma

# Install all dependencies (needed for prisma CLI)
RUN pnpm install

# Copy built files
COPY --from=builder /app/dist ./dist

# Create tmp directory for temporary files
RUN mkdir -p /app/tmp

# Set environment to production
ENV NODE_ENV=production

# Generate Prisma Client and start the application  
CMD sh -c "pnpm db:generate && node dist/index.js"

