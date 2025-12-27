# Configuración de GitHub Secrets

Este documento explica cómo configurar los secrets necesarios en GitHub para que el CI/CD funcione correctamente.

## Acceder a la configuración de Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret** para agregar cada secret

## Secrets Requeridos

### 1. Base de Datos (Producción)

Estos secrets son para conectarse a la base de datos de Supabase en producción:

```
DB_HOST
Valor: aws-1-us-east-2.pooler.supabase.com

DB_PORT
Valor: 5432

DB_NAME
Valor: postgres

DB_USER
Valor: postgres.dkwsuwpydwoopfuceqaf

DB_PASSWORD
Valor: avfc0vKkIV72g7RN
```

### 2. Supabase (API Keys)

Estos secrets son para que la aplicación frontend pueda conectarse a Supabase:

```
VITE_SUPABASE_URL
Valor: https://dkwsuwpydwoopfuceqaf.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY
Valor: sb_publishable_NygxM7jIbAwN_qv2OCrNCw_Lll64bb5

VITE_SUPABASE_PROJECT_ID
Valor: dkwsuwpydwoopfuceqaf
```

**Cómo obtener estos valores:**
1. Ve a https://supabase.com/dashboard/project/dkwsuwpydwoopfuceqaf/settings/api
2. Copia el **Project URL** → usar en `VITE_SUPABASE_URL`
3. Copia el **anon public** key → usar en `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Servidor VPS

Estos secrets son para deployar en tu servidor VPS:

```
VPS_HOST
Valor: 137.184.0.21

VPS_USER
Valor: root

VPS_SSH_KEY
Valor: [CONTENIDO DE ~/.ssh/clavesecreta]
```

**Cómo obtener el SSH Key:**
```bash
# En tu máquina local, ejecuta:
cat ~/.ssh/clavesecreta

# Copia TODO el contenido (incluyendo -----BEGIN RSA PRIVATE KEY----- y -----END RSA PRIVATE KEY-----)
# Pégalo en el secret VPS_SSH_KEY
```

## Verificar configuración

Una vez configurados todos los secrets, puedes verificar en:

**Settings** → **Secrets and variables** → **Actions**

Deberías ver 11 secrets configurados:
- ✅ DB_HOST (ya configurado)
- ✅ DB_PORT (ya configurado)
- ✅ DB_NAME (ya configurado)
- ✅ DB_USER (ya configurado)
- ✅ DB_PASSWORD (ya configurado)
- ✅ VITE_SUPABASE_URL (ya configurado)
- ✅ VITE_SUPABASE_PUBLISHABLE_KEY (ya configurado)
- ✅ VITE_SUPABASE_PROJECT_ID (ya configurado)
- ✅ VPS_HOST (ya configurado)
- ✅ VPS_USER (ya configurado)
- ⏳ VPS_SSH_KEY (pendiente - ver instrucciones arriba)

## Probar el workflow

Una vez configurados todos los secrets, puedes probar manualmente:

1. Ve a **Actions** en tu repositorio
2. Selecciona el workflow **Deploy to Production**
3. Click en **Run workflow** → **Run workflow**
4. Observa la ejecución y verifica que no haya errores

## Workflows Disponibles

### `deploy-migrations.yml`
- **Cuándo se ejecuta:** Al hacer push a `main` con cambios en `supabase/migrations/`
- **Qué hace:** Ejecuta solo las migraciones de base de datos pendientes

### `deploy-production.yml`
- **Cuándo se ejecuta:** Al hacer push a `main`
- **Qué hace:**
  1. Ejecuta tests
  2. Construye la aplicación
  3. Ejecuta migraciones de BD
  4. Deploya al servidor VPS
  5. Reinicia PM2
  6. Verifica que la app esté funcionando

## Ejecutar migraciones manualmente

Si necesitas ejecutar migraciones sin hacer deploy completo:

```bash
# Localmente (modo prueba)
node scripts/run-migrations.cjs --dry-run

# Localmente (aplicar migraciones)
node scripts/run-migrations.cjs

# Desde el script de deploy
bash deploy/deploy-with-migrations.sh
```

## Variables de entorno para desarrollo local

Crea un archivo `.env.local` para desarrollo:

```bash
# Base de datos (Desarrollo - usar la BD de desarrollo)
DB_HOST=aws-0-us-west-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.ezchqajzxaeepwqqzmyr
DB_PASSWORD=Factoria314775!

# Supabase API (Desarrollo)
VITE_SUPABASE_PROJECT_ID=ezchqajzxaeepwqqzmyr
VITE_SUPABASE_PUBLISHABLE_KEY=[tu_anon_key_dev]
VITE_SUPABASE_URL=https://ezchqajzxaeepwqqzmyr.supabase.co
```

⚠️ **IMPORTANTE:** Nunca commitear archivos `.env.local` al repositorio.

## Solución de problemas

### Error: "Error connecting to database"
- Verifica que los secrets DB_* estén correctos
- Verifica que la IP de GitHub Actions esté permitida en Supabase (o que no haya firewall)

### Error: "SSH connection failed"
- Verifica que VPS_SSH_KEY contenga la clave privada completa
- Verifica que VPS_HOST y VPS_USER sean correctos
- Verifica que el servidor VPS esté accesible

### Error: "Migration already exists"
- Es normal, significa que la migración ya fue aplicada anteriormente
- El sistema las omite automáticamente

## Seguridad

- ✅ Nunca expongas los secrets en logs
- ✅ Usa diferentes credenciales para desarrollo y producción
- ✅ Rota las credenciales periódicamente
- ✅ Limita los permisos de las API keys al mínimo necesario
