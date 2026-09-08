#!/bin/sh
set -e

# Asegurar directorios de escritura y permisos incluso con volúmenes montados por el host (Coolify/Docker/VPS)
mkdir -p /app/public/uploads /app/public/updates
chown -R nextjs:nodejs /app/public /app/prisma 2>/dev/null || true
chmod -R 777 /app/public/uploads /app/public/updates 2>/dev/null || true

echo "🚀 [ElysiumPad] Iniciando contenedor de producción..."

# Esperar a que la base de datos esté accesible
echo "⏳ [ElysiumPad] Verificando conexión con la base de datos..."
MAX_RETRIES=30
RETRY_COUNT=0

until prisma db push --skip-generate --accept-data-loss || npx prisma db push --skip-generate --accept-data-loss; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ [ElysiumPad] No se pudo conectar a la base de datos después de $MAX_RETRIES intentos."
    exit 1
  fi
  echo "⏳ Esperando a que la base de datos esté lista ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done

echo "✅ [ElysiumPad] Esquema de base de datos sincronizado correctamente."

# Ejecutar seed para crear Admin y Settings iniciales si no existen
echo "🌱 [ElysiumPad] Ejecutando seed de datos iniciales..."
node prisma/seed.mjs || echo "⚠️ Advertencia: El seed retornó un estado no cero, continuando..."

echo "⚡ [ElysiumPad] Arrancando servidor Next.js..."
# Si se ejecuta como root, pasar ejecución al usuario seguro 'nextjs'
if [ "$(id -u)" = '0' ]; then
  exec su-exec nextjs "$@"
else
  exec "$@"
fi

