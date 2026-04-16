# ---- Estágio 1: Dependências ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- Estágio 2: Desenvolvimento (padrão no docker-compose) ----
FROM node:20-alpine AS dev
WORKDIR /app
# Copia dependências já instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# ---- Estágio 3: Build de produção ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---- Estágio 4: Runner de produção (imagem final enxuta) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copia apenas o output standalone do Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
