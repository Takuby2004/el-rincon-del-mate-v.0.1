# Plan de Reparación: Acceso Administrativo y Sincronización de Rol

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**Problema diagnosticado:** El usuario inicia sesión correctamente con Supabase Auth, pero la página se queda estancada en `/admin/login` sin mostrar error.

---

## 1. Confirmación de la Causa Raíz

Cuando ingresas las credenciales en `/admin/login`:
1. **Supabase Auth responde con éxito (HTTP 200):** Valida que el correo `rincondelmatebo@gmail.com` y la contraseña son válidos, y emite un token de acceso.
2. **El Backend consulta la tabla `User`:**
   * En la base de datos PostgreSQL, el registro existe (o fue creado previamente) con `role = 'CLIENT'`.
   * El código actual de [`backend/src/services/auth.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/auth.service.ts) solo asignaba `ADMIN` cuando el usuario **no existía**. Como el usuario ya existía en la base de datos, no actualizaba su rol a `ADMIN` a pesar de que su correo coincide exactamente con `ADMIN_EMAIL`.
3. **El Frontend recibe `role: 'CLIENT'`:**
   * Intenta navegar a `/admin/dashboard`.
   * El guardián de rutas ([`frontend/src/app/core/guards/auth.guard.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/core/guards/auth.guard.ts)) verifica: `user.role === 'ADMIN'`.
   * Al ser `CLIENT`, el guardián deniega el paso silenciosamente y **redirige de inmediato de vuelta a `/admin/login`**.
   * Resultado visual: La pantalla parpadea, la rueda de carga se detiene y parece "estancado" en el login.

---

## 2. Plan de Solución

### Modificación A: Auto-Elevación a ADMIN en el Backend (`auth.service.ts` y `auth.middleware.ts`)
* Normalizar el correo con `.trim().toLowerCase()`.
* Si el usuario que inicia sesión coincide con `ADMIN_EMAIL` y en la base de datos su rol está como `CLIENT`:
  * Actualizar automáticamente en la base de datos `role: 'ADMIN'`.
  * Devolver el rol actualizado `ADMIN` al frontend.
* En `auth.middleware.ts`, asegurar que si el token pertenece al correo del administrador, el rol asignado a la petición sea prioritariamente `ADMIN`.

### Modificación B: Script de Sincronización Inmediata (`npm run auth:sync-admin`)
* Crear un script en `backend/src/scripts/syncAdminUser.ts` que:
  * Busque el usuario con el correo de `ADMIN_EMAIL` (`rincondelmatebo@gmail.com`).
  * Si existe, actualice su rol a `ADMIN`.
  * Si no existe, lo cree con rol `ADMIN` vinculado a Supabase Auth.
* Agregar el script a `backend/package.json`.

### Modificación C: Limpieza del Campo de Correo en el Frontend (`admin-login.component.ts`)
* Cambiar el valor inicial de `email = 'admin@elrincondelmate.com'` por `''` (vacío) o el valor adecuado para evitar confusiones al iniciar sesión.

---

## 3. Estado de la Implementación
* **Estado:** ✅ Completado y verificado con éxito.
* **Backend:** Typecheck TypeScript exitoso (código 0).
* **Frontend:** Typecheck TypeScript exitoso (código 0).
* **README:** Actualizado con las instrucciones del script `auth:sync-admin`.

