# signalling-server Dockerfile

# builder stage
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

# production image
FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node","dist/index.js"]
