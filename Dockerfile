# Etapa 1: compilación
FROM node:18 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Etapa 2: ejecución
FROM node:18

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

ENV NODE_ENV=production

# ⬇️ CAMBIO CLAVE AQUÍ
CMD ["node", "dist/src/main.js"]
