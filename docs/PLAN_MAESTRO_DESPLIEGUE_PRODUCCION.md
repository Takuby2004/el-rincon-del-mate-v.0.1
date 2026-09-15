# 🗺️ Plan Maestro de Despliegue en Producción
### El Rincón del Mate v0.1

**Arquitectura:** Frontend en **Vercel** + Backend en **Render** + Base de Datos y Storage en **Supabase**  
**Fecha:** Septiembre 2026  
**Objetivo:** Guía de ejecución paso a paso sin fallos, ordenada cronológicamente con verificación en cada etapa.

---

## 🧭 Diagrama del Flujo de Despliegue

```
 ┌──────────────────────────────────────────────────────────────┐
 │  PASO 1: SUPABASE                                            │
 │  • Crear Proyecto                                            │
 │  • Crear Bucket Público de Storage: "el-rincon-del-mate"    │
 │  • Copiar Connection Strings (Pooler 6543 y Direct 5432)     │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  PASO 2: MIGRACIÓN DE BASE DE DATOS                          │
 │  • Ejecutar: npx prisma migrate deploy                       │
 │  • Ejecutar: npx prisma db seed                              │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  PASO 3: RENDER (Backend)                                    │
 │  • Conectar repositorio GitHub / Subcarpeta "backend"        │
 │  • Configurar Variables de Entorno (DB, Supabase, JWT)       │
 │  • Desplegar y obtener URL (ej. https://...onrender.com)     │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  PASO 4: VERCEL (Frontend)                                   │
 │  • Conectar repositorio GitHub / Subcarpeta "frontend"       │
 │  • Desplegar Angular SPA con vercel.json                     │
 │  • Obtener URL pública (ej. https://...vercel.app)           │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  PASO 5: AJUSTE FINAL Y VERIFICACIÓN                         │
 │  • Configurar ALLOWED_ORIGINS en Render con la URL de Vercel │
 │  • Probar flujo completo: Catálogo, QR, Login Admin y Fotos  │
 └──────────────────────────────────────────────────────────────┘
```

---

## 📋 Fase 1: Configuración de Supabase (Base de Datos & Almacenamiento)

### 1.1. Crear el Proyecto en Supabase
1. Ingresa a [https://supabase.com/](https://supabase.com/) e inicia sesión.
2. Haz clic en **New Project**.
3. Asigna un nombre (ej. `el-rincon-del-mate-db`) y una **contraseña segura para la base de datos** (¡anótala bien!).
4. Selecciona la región más cercana a tus usuarios (ej. `South America (São Paulo)`).

### 1.2. Crear el Bucket de Almacenamiento para las Fotos
1. En el menú lateral izquierdo de Supabase, ve a **Storage**.
2. Haz clic en **New Bucket**.
3. Nombre del bucket: `el-rincon-del-mate`.
4. Marca la casilla **Public Bucket** (esto permite que las fotos de productos se puedan ver públicamente en la tienda).
5. Guarda los cambios.

### 1.3. Obtener las Credenciales y Cadenas de Conexión
1. Ve a **Project Settings > Database**:
   - Baja a la sección **Connection String**.
   - Pestaña **URI**:
     - Modo **Session (Puerto 5432)** -> Guarda esta URL como `DIRECT_URL`.
     - Modo **Transaction (Puerto 6543)** -> Guarda esta URL como `DATABASE_URL`.
2. Ve a **Project Settings > API**:
   - Copia la **Project URL** (ej. `https://xyzcompany.supabase.co`).
   - Copia la clave **service_role** (Secret Key con permisos de escritura para Storage).

### 1.4. Ejecutar Migraciones y Semillado Inicial (Seed)
Desde tu terminal local en la carpeta `backend/`:
```bash
# 1. Configura temporalmente las variables en tu .env local o pásalas por consola
DATABASE_URL="tu_cadena_de_supabase_pooler"
DIRECT_URL="tu_cadena_de_supabase_direct"

# 2. Crea las tablas en Supabase
npx prisma migrate deploy

# 3. Llena la base de datos con los productos, categorías y el usuario admin inicial
npx prisma db seed
```

---

## 📋 Fase 2: Despliegue del Backend en Render

### 2.1. Crear el Servicio Web
1. Ingresa a [https://render.com/](https://render.com/) e inicia sesión.
2. Haz clic en **New +** y selecciona **Web Service**.
3. Conecta tu repositorio de GitHub donde está el proyecto.
4. Completa la configuración:
   - **Name:** `el-rincon-del-mate-backend`
   - **Region:** La misma que elegiste en Supabase (ej. São Paulo o Ohio).
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`

### 2.2. Configurar Variables de Entorno en Render
En la pestaña **Environment** de tu servicio en Render, agrega las siguientes variables:

| Clave (Key) | Valor (Value) | Descripción |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo de producción optimizado |
| `PORT` | `3000` | Puerto del servidor |
| `DATABASE_URL` | *(Cadena copiada de Supabase puerto 6543 con `?pgbouncer=true`)* | Conexión transaccional a PostgreSQL |
| `DIRECT_URL` | *(Cadena directa de Supabase puerto 5432)* | Conexión directa para migraciones |
| `JWT_SECRET` | `el_rincon_del_mate_jwt_secret_super_seguro_2026` | Clave secreta para tokens de autenticación |
| `ALLOWED_ORIGINS` | `*` *(Temporalmente, hasta tener la URL de Vercel)* | Permite la conexión del frontend |
| `SUPABASE_URL` | `https://[PROJECT-ID].supabase.co` | URL de tu proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `[TU_SERVICE_ROLE_KEY]` | Clave para subir fotos a Supabase Storage |
| `SUPABASE_STORAGE_BUCKET` | `el-rincon-del-mate` | Nombre del bucket creado |

### 2.3. Desplegar y Validar
1. Haz clic en **Create Web Service**.
2. Render compilará el código y verás en los logs: `Server running on http://localhost:3000`.
3. Copia la URL pública que te asigna Render (ejemplo: `https://el-rincon-del-mate-backend.onrender.com`).
4. Abre esa URL en tu navegador; deberías ver:
   ```json
   {
     "app": "El Rincón del Mate - Backend API",
     "status": "ONLINE",
     "version": "1.0.0"
   }
   ```

---

## 📋 Fase 3: Despliegue del Frontend en Vercel

### 3.1. Verificar la URL en el Frontend
Asegúrate de que el archivo `frontend/src/environments/environment.prod.ts` contenga la URL que te acaba de entregar Render:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://el-rincon-del-mate-backend.onrender.com/api',
  baseUrl: 'https://el-rincon-del-mate-backend.onrender.com'
};
```
*(Haz `git push` a tu repositorio con este cambio).*

### 3.2. Importar el Proyecto en Vercel
1. Ingresa a [https://vercel.com/](https://vercel.com/) e inicia sesión.
2. Haz clic en **Add New... > Project**.
3. Selecciona tu repositorio de GitHub.
4. En la pantalla de configuración:
   - **Framework Preset:** `Angular`
   - **Root Directory:** Haz clic en *Edit* y selecciona `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/el-rincon-del-mate/browser`
5. Haz clic en **Deploy**.

### 3.3. Obtener URL de Producción
En aproximadamente 1 minuto, Vercel finalizará y te entregará tu dominio público (ejemplo: `https://el-rincon-del-mate.vercel.app`).

---

## 📋 Fase 4: Sincronización Final y Verificación Post-Despliegue

### 4.1. Ajustar CORS en Render
Vuelve al panel de **Render > Environment** y actualiza la variable:
- `ALLOWED_ORIGINS`: `https://el-rincon-del-mate.vercel.app` (o el dominio propio que tengas).

---

## 🧪 Matriz de Pruebas de Calidad (Smoke Tests)

| # | Prueba | Cómo realizarla | Resultado Esperado |
| :-: | :--- | :--- | :--- |
| **T01** | Carga de Catálogo | Entra a la URL de Vercel en modo incógnito. | Los productos se muestran con precios en Bs. e imágenes sin enlaces rotos. |
| **T02** | Rutas SPA / Recarga | Ve a `/catalogo` o `/admin/login` y presiona **F5**. | La página recarga sin dar error 404 de Vercel. |
| **T03** | Login Administrador | Entra a `/admin/login` con `admin@elrincondelmate.com` y `admin123`. | Ingresa al panel de administración exitosamente. |
| **T04** | Subida de Foto | En el panel admin, crea o edita una categoría o producto y sube una foto. | La foto se guarda en Supabase Storage y se visualiza de inmediato. |
| **T05** | Flujo de Pedido con QR | Agrega un producto al carrito, llena tus datos y sube un comprobante de prueba. | El pedido se crea, descuenta el stock y queda en espera de verificación. |

---

## 📚 Glosario de Conceptos para Desarrolladores Juniors

1. **Smoke Testing (Pruebas de Humo):**  
   * *Explicación sencilla:* Es una revisión rápida de las funciones más importantes de la tienda (como encender el motor de un auto) para confirmar que nada esté "echando humo" antes de abrirla al público.
2. **Build Artifact (Artefacto de Compilación):**  
   * *Explicación sencilla:* Es la versión final, minificada y ultra rápida de tu código (HTML, CSS y JS comprimidos) lista para que el navegador de los clientes la descargue en milisegundos.
3. **CORS Whitelist (Lista Blanca de CORS):**  
   * *Explicación sencilla:* Es la lista de invitados VIP de tu backend. Solo las páginas web que estén en esa lista (tu dominio en Vercel) tienen permiso de pedirle datos.
4. **Prisma Migrate Deploy:**  
   * *Explicación sencilla:* Es el comando que lee los planos de tu base de datos y construye las tablas, columnas y relaciones reales en Supabase sin tocar los datos existentes.
