# Guía de Auditoría y Verificación: Uso de Supabase en el Proyecto

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**ID del Proyecto Supabase:** `gleylrngndyvxaucxfrf`  
**URL del Proyecto:** `https://gleylrngndyvxaucxfrf.supabase.co`

---

## 1. ¿Se está utilizando Supabase en el proyecto?
**SÍ, rotunda y activamente.**  
Supabase es actualmente la columna vertebral de la infraestructura en la nube del proyecto, participando en 3 pilares esenciales:

```mermaid
flowchart LR
    A[El Rincón del Mate Backend] -->|1. SQL & Modelos| B[(Supabase PostgreSQL Database)]
    A -->|2. Registro & Login| C[Supabase Auth]
    A -->|3. Fotos de Productos y Pagos| D[Supabase Storage Buckets]
```

---

## 2. Los 3 Pilares de Supabase en el Código

### Pilar 1: Base de Datos PostgreSQL en la Nube
* **Dónde está configurado:** En [`backend/.env`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/.env) línea 29:
  ```env
  DATABASE_URL="postgresql://postgres.gleylrngndyvxaucxfrf:Chango_2004_@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  ```
* **Qué hace:** Cada vez que la tienda consulta productos, crea pedidos, cambia inventarios o lista clientes, el ORM Prisma se conecta a los servidores de Supabase en AWS Virginia.

### Pilar 2: Bóveda de Autenticación (Supabase Auth)
* **Dónde está configurado:** En [`backend/src/config/supabase.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/config/supabase.ts) y [`backend/src/services/auth.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/auth.service.ts).
* **Qué hace:** Las contraseñas nunca se guardan en texto plano en la aplicación; son custodiadas y cifradas en Supabase Auth (`supabase.auth.signInWithPassword` y `supabase.auth.signUp`).

### Pilar 3: Almacenamiento de Imágenes (Supabase Storage)
* **Dónde está configurado:** En [`backend/src/utils/fileStorageService.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/utils/fileStorageService.ts) y el bucket `el-rincon-del-mate`.
* **Qué hace:** Aloja las imágenes de productos, categorías y comprobantes de pago en la nube pública de Supabase.

---

## 3. Métodos Paso a Paso para Verificarlo

### Método 1: En el Panel Web de Supabase (El más visual e inmediato)
1. Inicia sesión en tu cuenta de [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto: **`gleylrngndyvxaucxfrf`**.
3. **Comprobar la Base de Datos:**
   * Haz clic en el menú izquierdo en **"Table Editor"** (icono de tabla).
   * Verás todas las tablas de tu tienda: `Product`, `Category`, `Order`, `OrderItem`, `User`, `PaymentProof`, etc. Al hacer clic sobre cualquiera, verás tus registros en tiempo real.
4. **Comprobar los Usuarios (Auth):**
   * Haz clic en **"Authentication"** > **"Users"**.
   * Verás la lista de usuarios, incluido `rincondelmatebo@gmail.com`, con su identificador único (UID) y fecha de confirmación.
5. **Comprobar el Almacenamiento (Storage):**
   * Haz clic en **"Storage"** > **"Buckets"**.
   * Verás el bucket llamado `el-rincon-del-mate`.

### Método 2: Desde la Terminal del Backend
Puedes verificar que la conexión está viva y apuntando a Supabase ejecutando en una terminal dentro de la carpeta `backend`:
```bash
npm run auth:sync-admin
```
Si la conexión a Supabase es exitosa, el comando leerá la tabla de administradores de PostgreSQL en Supabase y te mostrará el resultado con un check verde.

### Método 3: En el Navegador Web (Inspeccionando el Token de Acceso)
1. Abre tu tienda en el navegador (`http://localhost:4200/admin/login`).
2. Abre la consola de desarrollo (Presiona `F12` y ve a la pestaña **Aplicación** o **Application** > **Session Storage** > `http://localhost:4200`).
3. Revisa la clave `mate_token`:
   * Es un token JWT largo. Si lo copias y lo pegas en [jwt.io](https://jwt.io), verás el emisor (`iss`):
   * `"iss": "https://gleylrngndyvxaucxfrf.supabase.co/auth/v1"`
   * Esto demuestra que la sesión fue generada y firmada oficialmente por los servidores de Supabase.

