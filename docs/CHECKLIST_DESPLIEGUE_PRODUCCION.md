# 🚀 Checklist y Bitácora de Despliegue en Producción

**Proyecto:** El Rincón del Mate v0.1  
**Fecha:** Noviembre 2026  
**Infraestructura:**  
- **Base de Datos & Storage:** Supabase (PostgreSQL + Object Storage)  
- **Backend API:** Render (Node.js + Express + Prisma)  
- **Frontend SPA:** Vercel (Angular 19 Standalone)  

---

## 📋 Estado del Despliegue por Etapas

| Etapa | Plataforma | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Supabase | Creación de proyecto, base de datos, bucket de storage y credenciales | ✅ Completado |
| **Fase 2** | Local / Prisma | Ejecución de migraciones (`db push`) y sembrado inicial (`db seed`) | ✅ Completado |
| **Fase 3** | Render | Configuración de Web Service en subcarpeta `/backend` y variables de entorno | ⏳ En Proceso |
| **Fase 4** | Git / Frontend | Sincronización de URL de producción del backend en `environment.prod.ts` | ⏹️ Pendiente de Fase 3 |
| **Fase 5** | Vercel | Despliegue de Angular en subcarpeta `/frontend` con `dist/el-rincon-del-mate/browser` | ⏹️ Pendiente de Fase 4 |
| **Fase 6** | Render (CORS) | Configuración de `ALLOWED_ORIGINS` y `FRONTEND_URL` con el dominio final de Vercel | ⏹️ Pendiente de Fase 5 |
| **Fase 7** | QA Producción | Verificación de catálogo, login admin, compra, subida a Supabase y descarga PDF | ⏹️ Pendiente de Fase 6 |

---

## 🔑 Variables de Entorno Requeridas en Producción

### 1. Backend (Render)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
JWT_SECRET=[MÍNIMO 32 CARACTERES ALEATORIOS]
FRONTEND_URL=https://[TU-DOMINIO].vercel.app
ALLOWED_ORIGINS=https://[TU-DOMINIO].vercel.app
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]
SUPABASE_STORAGE_BUCKET=el-rincon-del-mate
ADMIN_EMAIL=admin@elrincondelmate.com
ADMIN_PASSWORD=[CONTRASEÑA-SEGURA-ADMINISTRADOR]
```

### 2. Frontend (Vercel)
* Configurado a través de `frontend/src/environments/environment.prod.ts`:
  - `apiUrl`: `https://[TU-BACKEND].onrender.com/api`
  - `baseUrl`: `https://[TU-BACKEND].onrender.com`

---

## 📖 Glosario Técnico de Apoyo

* **Connection Pooler (Puerto 6543):** Gestor inteligente de conexiones que permite a cientos de clientes simultáneos consultar la tienda sin agotar la memoria de PostgreSQL.
* **Direct URL (Puerto 5432):** Conexión directa y sin intermediarios que requiere Prisma de forma obligatoria para ejecutar migraciones y modificar estructuras de tablas.
* **Service Role Key:** Llave maestra de Supabase que otorga permisos administrativos al backend para guardar y eliminar comprobantes de pago e imágenes en el Storage eludiendo políticas RLS (*Row Level Security*). Nunca debe exponerse en el frontend.
* **Output Directory:** Carpeta compilada que Vercel servirá a internet (`dist/el-rincon-del-mate/browser`).

