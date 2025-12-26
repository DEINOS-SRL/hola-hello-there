#!/bin/bash
# Script de deploy manual para dnscloud.deinos.com.ar

echo "🚀 Iniciando deploy a VPS de Producción..."
echo "Realizado por DEINOS BUILD - 26/12/2025"

# Conectar al servidor y ejecutar comandos
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
echo "✅ Deploy completado exitosamente!"
echo ""
pm2 list
ENDSSH

echo ""
echo "🌐 Tu aplicación está actualizada en: https://dnscloud.deinos.com.ar"
