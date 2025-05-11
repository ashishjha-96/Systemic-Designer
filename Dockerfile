# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy build output from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy public directory explicitly from the build context root
COPY ./public ./public

EXPOSE 3000

CMD ["npm", "start"]
