#!/bin/bash
# Script de deploy con migraciones para dnscloud.deinos.com.ar

echo "🚀 Iniciando deploy a VPS de Producción..."
echo "Realizado por DEINOS BUILD - $(date '+%d/%m/%Y %H:%M')"
echo ""

# Credenciales de la base de datos (se pueden pasar como variables de entorno)
DB_HOST="${DB_HOST:-aws-1-us-east-2.pooler.supabase.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres.dkwsuwpydwoopfuceqaf}"
DB_PASSWORD="${DB_PASSWORD:-avfc0vKkIV72g7RN}"

echo "📋 Paso 1: Ejecutando migraciones de base de datos..."
echo ""

# Conectar a la base de datos y ejecutar migraciones
export PGPASSWORD="$DB_PASSWORD"

# Crear schema de control de migraciones
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE SCHEMA IF NOT EXISTS migrations;" 2>/dev/null

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
CREATE TABLE IF NOT EXISTS migrations.applied_migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  checksum VARCHAR(64)
);
EOF

# Ejecutar migraciones pendientes
migration_count=0
for migration_file in supabase/migrations/*.sql; do
  if [ -f "$migration_file" ]; then
    filename=$(basename "$migration_file")
    checksum=$(md5sum "$migration_file" | cut -d' ' -f1)

    # Verificar si ya fue aplicada
    applied=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM migrations.applied_migrations WHERE filename = '$filename';")

    if [ "$applied" -eq 0 ]; then
      echo "▶️  Aplicando migración: $filename"

      if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"; then
        # Registrar migración aplicada
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO migrations.applied_migrations (filename, checksum) VALUES ('$filename', '$checksum');"
        echo "✅ Migración aplicada: $filename"
        ((migration_count++))
      else
        echo "❌ Error aplicando migración: $filename"
        echo "El deploy ha sido cancelado."
        exit 1
      fi
    else
      echo "⏭️  Migración ya aplicada: $filename"
    fi
  fi
done

if [ $migration_count -eq 0 ]; then
  echo "ℹ️  No hay migraciones pendientes"
else
  echo "✅ $migration_count migración(es) aplicada(s) exitosamente"
fi

echo ""
echo "📋 Paso 2: Desplegando aplicación al servidor..."
echo ""

# Conectar al servidor y ejecutar comandos de deploy
ssh -i ~/.ssh/clavesecreta root@137.184.0.21 << 'ENDSSH'
cd /var/www/dnscloud

echo "📥 Descargando últimos cambios..."
git reset --hard origin/main
git pull origin main
echo ""

echo "📦 Instalando dependencias..."
npm install
echo ""

echo "🔨 Construyendo aplicación..."
npm run build
echo ""

echo "🔄 Reiniciando aplicación..."
pm2 restart dnscloud
echo ""

echo "✅ Aplicación deployada exitosamente!"
echo ""

pm2 list
ENDSSH

echo ""
echo "🎉 Deploy completado exitosamente!"
echo "🌐 Tu aplicación está actualizada en: https://dnscloud.deinos.com.ar"
echo ""
