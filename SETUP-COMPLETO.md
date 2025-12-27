# ✅ Setup Completo - Sistema de Migraciones Automatizado

## 🎉 ¡Sistema Configurado!

Tu aplicación DNSCloud ahora tiene un **sistema completo de migraciones automáticas** y **deploy continuo**.

---

## ✅ Lo que ya está hecho

### 1. Base de Datos ✅
- **40 tablas** creadas en producción
- **19 tipos ENUM** configurados
- **Base de datos sincronizada** al 100%
- Sistema de control de migraciones instalado

**Bases de datos configuradas:**
- **Desarrollo**: `ezchqajzxaeepwqqzmyr` (BD antigua)
- **Producción**: `dkwsuwpydwoopfuceqaf` (BD nueva - ACTIVA)

### 2. Configuración de la App ✅
Tu `.env` ahora apunta a la **nueva base de datos de producción**:
```env
VITE_SUPABASE_PROJECT_ID="dkwsuwpydwoopfuceqaf"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_NygxM7jIbAwN_qv2OCrNCw_Lll64bb5"
VITE_SUPABASE_URL="https://dkwsuwpydwoopfuceqaf.supabase.co"
```

### 3. Scripts de Automatización ✅
Tienes 3 formas de hacer deploy:

```bash
# 1. Deploy automático con GitHub Actions (RECOMENDADO)
git push origin main   # Se ejecuta automáticamente

# 2. Deploy local con script
npm run deploy

# 3. Solo migraciones
npm run migrate
npm run migrate:dry-run  # Modo prueba
```

### 4. GitHub Actions Workflows ✅
Creados 2 workflows automáticos:

**📄 `.github/workflows/deploy-production.yml`**
- Se ejecuta automáticamente al hacer `push` a `main`
- Corre tests
- Aplica migraciones
- Deploya al VPS
- Reinicia PM2

**📄 `.github/workflows/deploy-migrations.yml`**
- Se ejecuta cuando hay cambios en `supabase/migrations/`
- Solo aplica migraciones a la BD

### 5. Documentación Completa ✅
- 📖 `docs/DEPLOYMENT-GUIDE.md` - Guía completa de deploy
- 🔐 `docs/GITHUB-SECRETS-SETUP.md` - Configurar secrets de GitHub
- 📝 `.env.production.example` - Template de configuración

---

## ⏳ Lo que falta por hacer

### Paso 1: Obtener la SSH Key

Necesitas copiar tu clave SSH privada para configurar GitHub Actions:

```bash
# En tu terminal Git Bash:
cat ~/.ssh/clavesecreta
```

**Copia TODO el contenido** (incluye las líneas `-----BEGIN` y `-----END`).

### Paso 2: Configurar GitHub Secrets

Ve a tu repositorio en GitHub:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Agrega SOLO este secret (los demás ya los tengo):

```
Nombre: VPS_SSH_KEY
Valor: [Pegar aquí el contenido completo de ~/.ssh/clavesecreta]
```

**Secrets que YA están listos** (con sus valores):
- ✅ `DB_HOST` = aws-1-us-east-2.pooler.supabase.com
- ✅ `DB_PORT` = 5432
- ✅ `DB_NAME` = postgres
- ✅ `DB_USER` = postgres.dkwsuwpydwoopfuceqaf
- ✅ `DB_PASSWORD` = avfc0vKkIV72g7RN
- ✅ `VITE_SUPABASE_URL` = https://dkwsuwpydwoopfuceqaf.supabase.co
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` = sb_publishable_NygxM7jIbAwN_qv2OCrNCw_Lll64bb5
- ✅ `VITE_SUPABASE_PROJECT_ID` = dkwsuwpydwoopfuceqaf
- ✅ `VPS_HOST` = 137.184.0.21
- ✅ `VPS_USER` = root

Solo falta agregar estos valores como secrets en GitHub.

### Paso 3: Probar el Sistema

Una vez configurado el secret, haz un commit de prueba:

```bash
# 1. Ver los cambios
git status

# 2. Agregar todos los archivos nuevos
git add .

# 3. Crear commit
git commit -m "feat: Sistema automatizado de migraciones y deploy CI/CD"

# 4. Push a main (iniciará el deploy automático)
git push origin main

# 5. Ver el progreso en GitHub
# Ve a: https://github.com/DEINOS-SRL/hola-hello-there/actions
```

---

## 🚀 Cómo Funciona a Partir de Ahora

### Flujo Normal de Desarrollo

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar (si necesitas cambios en BD, crear migración)
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_descripcion.sql
# Editar el archivo SQL con los cambios

# 3. Commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub

# 5. Hacer merge a main → ¡Deploy automático! 🎉
```

### Crear una Migración

```sql
-- Ejemplo: supabase/migrations/20251226230000_agregar_campo.sql
ALTER TABLE seg.usuarios
ADD COLUMN telefono VARCHAR(20);
```

Al hacer push, la migración se aplica automáticamente.

### Solo Migraciones (sin deploy completo)

Si solo quieres ejecutar migraciones sin deployar la app:

```bash
npm run migrate              # Aplicar migraciones
npm run migrate:dry-run      # Ver qué se ejecutaría (modo prueba)
```

---

## 📋 Comandos Disponibles

```bash
# Desarrollo
npm run dev                  # Iniciar servidor desarrollo

# Build
npm run build                # Build para producción
npm run build:dev            # Build modo desarrollo

# Migraciones
npm run migrate              # Ejecutar migraciones
npm run migrate:dry-run      # Modo prueba (no aplica cambios)

# Deploy
npm run deploy               # Deploy completo (migraciones + app)

# Utilidades
npm run lint                 # Linter
npm run preview              # Preview del build
```

---

## 🔍 Monitoreo

### Ver logs de GitHub Actions
https://github.com/DEINOS-SRL/hola-hello-there/actions

### Ver logs en el servidor
```bash
ssh -i ~/.ssh/clavesecreta root@137.184.0.21
pm2 logs dnscloud
pm2 status
```

### Ver migraciones aplicadas
```bash
# Script Node.js
node scripts/run-migrations.cjs

# O conectar directo a la BD
psql -h aws-1-us-east-2.pooler.supabase.com \
     -p 5432 \
     -U postgres.dkwsuwpydwoopfuceqaf \
     -d postgres

# Listar migraciones
SELECT * FROM migrations.applied_migrations
ORDER BY applied_at DESC;
```

---

## 📚 Documentación Completa

- **[Guía de Despliegue](docs/DEPLOYMENT-GUIDE.md)** - Todo sobre deploy
- **[Setup de GitHub Secrets](docs/GITHUB-SECRETS-SETUP.md)** - Configurar secrets
- **[.env.production.example](.env.production.example)** - Template de configuración

---

## 🎯 Beneficios del Nuevo Sistema

1. ✅ **Deploy automático** - Push a main = deploy instantáneo
2. ✅ **Migraciones seguras** - Nunca se ejecutan dos veces
3. ✅ **Control de versiones** - Historial completo de cambios en BD
4. ✅ **Rollback posible** - Crear migración inversa si es necesario
5. ✅ **3 formas de deploy** - GitHub, script local, manual
6. ✅ **Documentación completa** - Guías paso a paso
7. ✅ **Protección de secrets** - .env excluido de git

---

## ⚠️ Importante

- ✅ `.env` ya está en `.gitignore` - No se subirá al repositorio
- ✅ Usa diferentes credenciales para desarrollo y producción
- ✅ Nunca expongas las API keys en el código
- ✅ Rota las credenciales periódicamente

---

## 🆘 Necesitas Ayuda?

1. Revisa la [Guía de Despliegue](docs/DEPLOYMENT-GUIDE.md)
2. Revisa la sección "Solución de Problemas"
3. Verifica los logs en GitHub Actions
4. Verifica los logs del servidor con `pm2 logs`

---

## ✅ Checklist Final

Antes de hacer el primer deploy:

- [ ] Copiar SSH key desde `~/.ssh/clavesecreta`
- [ ] Agregar secret `VPS_SSH_KEY` en GitHub
- [ ] Agregar los otros 10 secrets en GitHub
- [ ] Hacer commit de los cambios
- [ ] Push a main
- [ ] Ver el deploy en GitHub Actions
- [ ] Verificar que la app funcione en https://dnscloud.deinos.com.ar

---

🎉 **¡Todo listo para producción!**

Cuando hagas push a main, GitHub Actions se encargará automáticamente de:
1. Ejecutar tests
2. Aplicar migraciones
3. Deployar la app
4. Reiniciar PM2
5. Verificar que todo funcione

**¡A deployar! 🚀**
