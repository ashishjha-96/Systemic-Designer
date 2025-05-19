
# Dockerfile

# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# Ensures that these are cached unless they change
COPY package*.json ./

# Install dependencies
# Using --frozen-lockfile or --ci is recommended for reproducible builds
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
# This includes src, public, next.config.ts, tsconfig.json, etc.
COPY . .

# Ensure the /app/public directory exists in the builder stage.
# If the project doesn't have a public folder or it's .dockerignored,
# this command ensures the COPY in the runner stage doesn't fail.
RUN mkdir -p /app/public

# Set build-time environment variables if needed
# ARG GOOGLE_API_KEY
# ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}
# Add any other NEXT_PUBLIC_ variables required at build time as ARGs and ENVs

# Build the Next.js application
RUN npm run build

# Optional: Prune development dependencies if space is critical
# RUN npm prune --production

# Stage 2: Serve the application
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary configuration files
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
# If package-lock.json exists, copy it for installing only production dependencies
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy built assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Install production dependencies
# This assumes package.json copied above contains all dependencies.
# If you pruned in builder stage, you'd copy over node_modules instead:
# COPY --from=builder /app/node_modules ./node_modules
RUN npm install --production --frozen-lockfile

# Expose the port the app runs on (ensure it matches the start command in package.json or -p flag)
# The package.json uses "start": "next start" (which defaults to 3000 unless PORT env var is set)
# We need to ensure the app started by `npm start` listens on the EXPOSEd port, or that `PORT` is set.
ENV PORT=3000
EXPOSE 3000

USER nextjs

CMD ["npm", "start"]
