# Etapa 1: compilación
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2: ejecución
FROM node:18

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --only=production

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
