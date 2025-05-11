# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install

COPY . /app/ # Copy rest of the application code

RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy package.json and lock file for installing production dependencies
COPY package.json /app/
COPY package-lock.json /app/

# Install only production dependencies
RUN npm install --production

# Copy the built application
COPY --from=builder /app/.next /app/.next

# If next.config.js/ts is needed at runtime, copy it.
COPY --from=builder /app/next.config.ts /app/next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
