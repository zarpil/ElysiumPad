FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 1. Dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Generar cliente de Prisma para PostgreSQL
RUN npx prisma generate
RUN npm run build

# 3. Runner para Producción (Proxmox, Coolify, VPS, Docker Compose)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar su-exec para degradación segura de privilegios y CLI de Prisma
RUN apk add --no-cache su-exec
RUN npm install -g prisma@6.19.3

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar artefactos optimizados del build standalone con propiedad de nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Crear y conceder permisos iniciales en directorios de escritura (uploads y updates)
RUN mkdir -p /app/public/uploads /app/public/updates && \
    chmod -R 777 /app/public/uploads /app/public/updates && \
    chown -R nextjs:nodejs /app/public

# Script de inicio automatizado (Permisos + Migración + Seed + Next Server)
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
