# Diagnóstico y Solución: Error 401 en Login con Supabase Auth

## 1. Causa Raíz Detectada

Se identificaron dos factores simultáneos que provocaban el error `401 Unauthorized` / `Credenciales inválidas`:

### Factor 1: Configuración de Clave en el Cliente de Supabase (`backend/src/config/supabase.ts`)
- En el backend desplegado en Render, la variable `SUPABASE_SERVICE_ROLE_KEY` estaba teniendo precedencia sobre la clave pública (`SUPABASE_ANON_KEY`):
  ```typescript
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || '...';
  ```
- En el ecosistema de Supabase, el método `auth.signInWithPassword` es una operación de sesión de usuario final. Si se ejecuta utilizando la clave secreta de administración (`service_role`), Supabase Auth rechaza la solicitud arrojando `Invalid login credentials`.
- **Solución Técnica:** Separar de forma estricta los dos clientes en `backend/src/config/supabase.ts`:
  - `supabase`: Instanciado **siempre** con la clave pública `anon` para operaciones de inicio de sesión (`signInWithPassword`) y registro (`signUp`).
  - `supabaseAdmin`: Instanciado con `SUPABASE_SERVICE_ROLE_KEY` exclusivamente para tareas administrativas y de Storage.

### Factor 2: Discrepancia de Contraseña
- En Supabase Auth, el usuario `leonardoazamavillena@gmail.com` fue creado con la contraseña **`Chango2004`**.
- En el archivo local `.env`, la variable figuraba como `#Chango_2004_#` (con `#` y `_`), lo que generaba confusión al ingresar las credenciales.

---

## 2. Plan de Acción Inmediato

1. **Corrección de Código en Backend:**
   - Modificar [`backend/src/config/supabase.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/config/supabase.ts) para que `export const supabase` use siempre la clave pública `anon` (`sb_publishable_G6c3Jhy7DL4YBnCIsGWvzw_UMqOWpC7` o `SUPABASE_ANON_KEY`).
2. **Actualización de `.env` Local:**
   - Actualizar `ADMIN_PASSWORD` en `backend/.env` para reflejar con exactitud `Chango2004`.
3. **Commit y Despliegue en Render:**
   - Subir el cambio a GitHub `main` para que Render actualice el servicio backend automáticamente.
4. **Prueba de Acceso:**
   - Ingresar en el panel administrativo con `leonardoazamavillena@gmail.com` y la contraseña `Chango2004`.

