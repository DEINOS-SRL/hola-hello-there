# Guía de Despliegue - DNSCloud

Sistema automatizado de despliegue con migraciones de base de datos para DNSCloud.

## 📋 Índice

- [Arquitectura](#arquitectura)
- [Configuración Inicial](#configuración-inicial)
- [Métodos de Despliegue](#métodos-de-despliegue)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Flujo de Trabajo](#flujo-de-trabajo)

## 🏗️ Arquitectura

### Bases de Datos

**Desarrollo:**
- Host: aws-0-us-west-2.pooler.supabase.com
- Proyecto: ezchqajzxaeepwqqzmyr
- Uso: Desarrollo local y pruebas

**Producción:**
- Host: aws-1-us-east-2.pooler.supabase.com
- Proyecto: dkwsuwpydwoopfuceqaf
- Uso: Aplicación en producción

### Servidor VPS

- Host: 137.184.0.21
- Usuario: root
- Ruta app: /var/www/dnscloud
- Process Manager: PM2
- Dominio: https://dnscloud.deinos.com.ar

## ⚙️ Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/DEINOS-SRL/hola-hello-there.git
cd hola-hello-there
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar GitHub Secrets

Sigue las instrucciones en [`GITHUB-SECRETS-SETUP.md`](./GITHUB-SECRETS-SETUP.md)

### 4. Configurar acceso SSH al VPS

```bash
# Asegúrate de tener la clave SSH configurada
chmod 600 ~/.ssh/clavesecreta

# Prueba la conexión
ssh -i ~/.ssh/clavesecreta root@137.184.0.21
```

## 🚀 Métodos de Despliegue

### Método 1: GitHub Actions (Recomendado)

**Deploy automático al hacer push a main:**

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

GitHub Actions automáticamente:
1. ✅ Ejecuta tests
2. ✅ Construye la aplicación
3. ✅ Aplica migraciones de BD
4. ✅ Deploya al VPS
5. ✅ Reinicia PM2

**Deploy manual desde GitHub:**

1. Ve a **Actions** en GitHub
2. Selecciona **Deploy to Production**
3. Click en **Run workflow**

### Método 2: Script Local con Migraciones

```bash
# Ejecutar deploy completo (migraciones + aplicación)
bash deploy/deploy-with-migrations.sh
```

Este script:
1. Ejecuta migraciones pendientes en la BD de producción
2. Conecta al VPS via SSH
3. Descarga últimos cambios
4. Instala dependencias
5. Construye la aplicación
6. Reinicia PM2

### Método 3: Script Local Simple

```bash
# Solo deploy de aplicación (sin migraciones)
bash deploy/deploy.sh
```

### Método 4: Solo Migraciones

```bash
# Modo prueba (no aplica cambios)
node scripts/run-migrations.cjs --dry-run

# Aplicar migraciones
node scripts/run-migrations.cjs
```

## 🗄️ Migraciones de Base de Datos

### Estructura de Migraciones

```
supabase/migrations/
├── 20251226151058_..._crear_tablas_comercial.sql
├── 20251226152200_..._crear_tablas_empleados.sql
└── ...
```

### Crear una Nueva Migración

```bash
# 1. Crear archivo con timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_descripcion.sql

# 2. Escribir el SQL
# Ejemplo:
CREATE TABLE IF NOT EXISTS mi_esquema.mi_tabla (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre varchar(255) NOT NULL
);

# 3. Commit y push
git add supabase/migrations/
git commit -m "migration: agregar tabla mi_tabla"
git push origin main
```

### Sistema de Control de Migraciones

Las migraciones se registran en:
- Schema: `migrations`
- Tabla: `migrations.applied_migrations`

```sql
SELECT * FROM migrations.applied_migrations
ORDER BY applied_at DESC;
```

Cada migración se ejecuta **una sola vez**. Si ya fue aplicada, se omite automáticamente.

### Rollback de Migraciones

⚠️ **No hay rollback automático**. Si necesitas revertir cambios:

1. Crear una nueva migración que revierta los cambios
2. Aplicarla normalmente

Ejemplo:
```sql
-- 20251226120000_drop_columna.sql
ALTER TABLE mi_esquema.mi_tabla
DROP COLUMN columna_incorrecta;
```

## 🔄 Flujo de Trabajo

### Para Desarrollo

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y crear migraciones si es necesario
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_nueva_feature.sql

# 3. Probar localmente
npm run dev

# 4. Probar migraciones en desarrollo
DB_HOST=aws-0-us-west-2.pooler.supabase.com \
DB_USER=postgres.ezchqajzxaeepwqqzmyr \
DB_PASSWORD=Factoria314775! \
node scripts/run-migrations.cjs

# 5. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 6. Crear Pull Request en GitHub

# 7. Merge a main → Deploy automático
```

### Para Hotfix

```bash
# 1. Crear rama desde main
git checkout main
git pull
git checkout -b hotfix/bug-critico

# 2. Fix el bug

# 3. Commit y push
git add .
git commit -m "fix: corregir bug crítico"
git push origin hotfix/bug-critico

# 4. Merge directo a main o crear PR urgente

# 5. Deploy automático al merge
```

## 📊 Monitoreo

### Ver logs del deploy

**En GitHub Actions:**
- Ve a **Actions** → Selecciona el workflow → Ver logs

**En el servidor VPS:**
```bash
ssh -i ~/.ssh/clavesecreta root@137.184.0.21

# Ver logs de PM2
pm2 logs dnscloud

# Ver últimas 100 líneas
pm2 logs dnscloud --lines 100

# Ver estado
pm2 status
```

### Ver migraciones aplicadas

```bash
# Conectar a la BD de producción
psql -h aws-1-us-east-2.pooler.supabase.com \
     -p 5432 \
     -U postgres.dkwsuwpydwoopfuceqaf \
     -d postgres

# Listar migraciones
SELECT
  filename,
  applied_at,
  execution_time_ms
FROM migrations.applied_migrations
ORDER BY applied_at DESC;
```

## 🐛 Solución de Problemas

### El deploy falla en las migraciones

```bash
# 1. Verificar el error en los logs de GitHub Actions

# 2. Probar la migración localmente contra BD de desarrollo
node scripts/run-migrations.cjs --dry-run

# 3. Si hay error SQL, corregir y crear nueva migración

# 4. Si la migración está corrupta, marcarla como aplicada manualmente:
psql -h aws-1-us-east-2.pooler.supabase.com \
     -p 5432 \
     -U postgres.dkwsuwpydwoopfuceqaf \
     -d postgres

INSERT INTO migrations.applied_migrations (filename, checksum)
VALUES ('nombre_archivo.sql', 'md5sum_del_archivo');
```

### La aplicación no inicia en el VPS

```bash
ssh -i ~/.ssh/clavesecreta root@137.184.0.21

# Ver errores de PM2
pm2 logs dnscloud --err

# Reiniciar manualmente
cd /var/www/dnscloud
npm run build
pm2 restart dnscloud

# Ver variables de entorno
pm2 env 0
```

### Cambios no se reflejan en producción

```bash
# 1. Verificar que el deploy se completó
# Ver Actions en GitHub

# 2. Limpiar cache del navegador (Ctrl+Shift+R)

# 3. Verificar en el servidor
ssh -i ~/.ssh/clavesecreta root@137.184.0.21
cd /var/www/dnscloud
git log -1  # Ver último commit
```

## 📝 Checklist Pre-Deploy

Antes de hacer merge a main:

- [ ] Tests pasan localmente (`npm test`)
- [ ] Build exitoso (`npm run build`)
- [ ] Migraciones probadas en BD de desarrollo
- [ ] Sin console.logs olvidados
- [ ] Sin credenciales hardcodeadas
- [ ] README actualizado si hay cambios en API
- [ ] Pull Request revisado
- [ ] Confirmar que no rompe funcionalidad existente

## 🔐 Seguridad

- ✅ No commitear archivos `.env*`
- ✅ Usar secrets de GitHub para credenciales
- ✅ Diferentes credenciales para dev y prod
- ✅ Rotar SSH keys periódicamente
- ✅ Limitar acceso a secrets solo a admin

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Migrations Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
