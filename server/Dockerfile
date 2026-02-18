# build stage
FROM node:24-alpine AS builder
WORKDIR /app

# copy manifests first so we leverage Docker cache
COPY package*.json tsconfig.json ./
COPY src ./src

# install dev deps so we can run the TypeScript compiler
RUN npm install
RUN npm run build

# production image
FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node","dist/index.js"]
