# builder stage
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

RUN npm run build

# runner stage
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy only necessary files from build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm","start"]
