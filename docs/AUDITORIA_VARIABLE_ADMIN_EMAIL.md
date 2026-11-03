# Auditoría Técnica: Utilidad y Necesidad de la Variable `ADMIN_EMAIL` en `.env`

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**Propósito:** Analizar la presencia, usos, dependencias y riesgos de mantener o eliminar la variable de entorno `ADMIN_EMAIL`.

---

## 1. Resumen Ejecutivo (TL;DR)
**Sí, es necesaria y muy recomendada.**  
Actualmente, `ADMIN_EMAIL` cumple el rol de **salvavidas (fallback) de seguridad y auto-asignación de permisos**. Aunque el sistema consulta prioritariamente la base de datos (`prisma.user`), la variable garantiza que el dueño nunca quede bloqueado sin permisos de administrador ante fallas de sincronización o de red.

---

## 2. Dónde y Cómo se Utiliza en el Código

### A. Auto-asignación de Rol de Administrador (`backend/src/services/auth.service.ts`)
* **Ubicación:** Líneas 93 - 104.
* **Mecanismo:** Cuando un usuario inicia sesión mediante Supabase Auth y su registro aún no existe en la base de datos PostgreSQL local (`prisma.user`), el sistema lo auto-registra al vuelo.
* **Función:** Compara el correo entrante con `process.env.ADMIN_EMAIL`. Si coincide, le asigna automáticamente `role: 'ADMIN'`. Si no coincide, le asigna `role: 'CLIENT'`.
* **Riesgo si no existe:** Si se elimina y la variable queda vacía, el código usa un valor por defecto quemado (`admin@elrincondelmate.com`). Si tu correo real es `rincondelmatebo@gmail.com`, el sistema te registraría como un cliente común (`CLIENT`) en lugar de Administrador.

### B. Salvaguarda en Middleware de Autenticación (`backend/src/middlewares/auth.middleware.ts`)
* **Ubicación:** Líneas 27 - 39 y Líneas 75 - 87.
* **Mecanismo:** En cada petición protegida a la API, el middleware valida el token JWT. Si por problemas de red o latencia la consulta a `prisma.user` tarda o devuelve nulo, evalúa:
  ```typescript
  const isEmailAdmin = email === adminEmail;
  req.user = {
    id: dbUser?.id || data.user.id,
    email,
    role: dbUser?.role || (isEmailAdmin ? 'ADMIN' : 'CLIENT')
  };
  ```
* **Función:** Garantiza que el administrador conserve sus privilegios de acceso incluso si la base de datos experimenta latencia o desconexión temporal.

### C. Respaldo para Notificaciones de Correo (`backend/src/services/email.service.ts`)
* **Ubicación:** Líneas 251 - 275.
* **Mecanismo:** Al despachar correos a los clientes (como confirmaciones de pedido) o al enviar la alerta de nuevo pedido al dueño:
  1. Busca en la base de datos al usuario con `role: 'ADMIN'`.
  2. Si la base de datos no responde o la tabla está vacía, recurre a `process.env.ADMIN_EMAIL`.
* **Función:** Evita que el servicio de correo colapse si la base de datos está inaccesible.

---

## 3. Matriz de Impacto

| Escenario | Con `ADMIN_EMAIL` en `.env` | Sin `ADMIN_EMAIL` en `.env` |
| :--- | :--- | :--- |
| **Primer inicio de sesión del dueño** | Se le asigna rol `ADMIN` de inmediato. | Queda como `CLIENT` por usar el fallback genérico. |
| **Falla momentánea de conexión a la BD** | El dueño sigue teniendo acceso al panel gracias al token y al correo. | Podría perder temporalmente el acceso con error 403 Forbidden. |
| **Envío de alertas de pedidos** | Respaldo seguro con el correo real del dueño. | Si falla la BD, enviaría o usaría un correo falso por defecto. |

---

## 4. Conclusión y Recomendación Técnica
1. **Mantener la variable:** Conservar `ADMIN_EMAIL="rincondelmatebo@gmail.com"` en `backend/.env`.
2. **Consistencia:** Mantener este valor idéntico al correo registrado en la base de datos para el usuario administrador.

