# 🚀 Guía y Diagnóstico de Despliegue en Producción
## Frontend en Vercel + Backend en Render + Base de Datos en Supabase

**Fecha:** Septiembre 2026  
**Proyecto:** El Rincón del Mate v0.1  
**Estado:** ✅ Proyecto 100% Configurado y Listo para Producción

---

## 1. 🛠️ Resumen de Adaptaciones Realizadas

Se preparó todo el código para operar sin fricción en la arquitectura de producción:

1. **Frontend (Vercel):**
   - Creado `src/environments/environment.ts` (desarrollo local `http://localhost:3000`).
   - Creado `src/environments/environment.prod.ts` (producción `https://el-rincon-del-mate-backend.onrender.com`).
   - Configurado `angular.json` con `fileReplacements` automático al compilar para producción.
   - Migrados los servicios `ApiService`, `AuthService` y el pipe `AssetUrlPipe` para consumir variables de entorno dinámicas.
   - Creado `vercel.json` para evitar errores 404 en rutas SPA (Single Page Application).

2. **Backend (Render + Supabase):**
   - Configurado `backend/package.json` con `"build": "prisma generate && tsc"` para asegurar que Prisma Client se construya en los servidores de Render.
   - Actualizado `schema.prisma` con soporte de `directUrl = env("DIRECT_URL")` para compatibilidad con *Connection Pooling* de Supabase.
   - Implementado soporte dual en `FileStorageService`: sube automáticamente a **Supabase Storage** si existen las variables de entorno en producción, y mantiene almacenamiento local en `/uploads/` durante desarrollo.

---

## 2. 📋 Paso a Paso para Desplegar

### Paso 1: Configurar Supabase
1. Ingresa a tu proyecto en [Supabase](https://supabase.com/).
2. En **Storage**, crea un bucket público llamado `el-rincon-del-mate` (o el nombre que prefieras).
3. En **Project Settings > Database > Connection String**:
   - Copia la URL de conexión en modo **Session / Transaction Pooler (Puerto 6543)** -> Será tu `DATABASE_URL`.
   - Copia la URL de conexión directa **(Puerto 5432)** -> Será tu `DIRECT_URL`.
4. En **Project Settings > API**, copia la `URL` del proyecto y la `service_role key` (o `anon key`).

---

### Paso 2: Desplegar el Backend en Render
1. En [Render](https://render.com/), crea un **Web Service** conectado a tu repositorio.
2. Parámetros de configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
3. Variables de Entorno (*Environment Variables*):
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   JWT_SECRET=tu_clave_secreta_super_segura_2026
   ALLOWED_ORIGINS=https://tu-tienda.vercel.app
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[TU_SERVICE_ROLE_KEY]
   SUPABASE_STORAGE_BUCKET=el-rincon-del-mate
   ```
4. Para ejecutar las migraciones iniciales en la base de datos de Supabase, puedes correr en tu terminal local:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

### Paso 3: Desplegar el Frontend en Vercel
1. En [Vercel](https://vercel.com/), crea un **New Project** e importa tu repositorio.
2. Parámetros de configuración:
   - **Framework Preset:** `Angular`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/el-rincon-del-mate/browser`
3. ¡Listo! Vercel desplegará tu frontend con certificado SSL gratuito (HTTPS) y cargará la configuración de producción.

---

## 3. 📖 Glosario de Conceptos para Desarrolladores Juniors

* **File Replacements (Reemplazo de Archivos en Build):**  
  * *Explicación sencilla:* Es una instrucción mágica de Angular que dice: "Cuando esté probando en mi computadora, usa el archivo A (con `localhost`); pero cuando vaya a compilar para internet, cámbialo silenciosamente por el archivo B (con la URL de Render)".
* **Supabase Storage:**  
  * *Explicación sencilla:* Es como un disco duro en la nube (similar a Google Drive) accesible por internet donde se guardan las fotos de los productos y comprobantes para que nunca se borren.
* **Direct URL vs Pooler URL:**  
  * *Explicación sencilla:* La *Direct URL* es una autopista directa que se usa solo cuando creas o modificas tablas (migraciones). La *Pooler URL* es una rotonda inteligente que maneja el tráfico diario de miles de clientes consultando la tienda.
