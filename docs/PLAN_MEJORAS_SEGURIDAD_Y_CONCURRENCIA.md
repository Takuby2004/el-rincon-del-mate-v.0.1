# 🛡️ Implementación de Mejoras de Seguridad y Concurrencia

**Fecha de Ejecución:** Septiembre 2026  
**Módulo:** Backend (Seguridad, Concurrencia de Inventario y Hardening)  
**Estado:** ✅ Implementado y Validado

---

## 1. 📋 Resumen de Cambios Realizados

Se aplicaron las recomendaciones prioritarias de la auditoría integral para blindar la API del backend contra ataques de fuerza bruta, peticiones no autorizadas y condiciones de carrera en el control de stock:

1. **Cabeceras HTTP de Seguridad con Helmet:**
   - Se integró el middleware `helmet()` configurando `crossOriginResourcePolicy: { policy: 'cross-origin' }` para permitir la carga segura de imágenes estáticas desde `/uploads`.
2. **Limitador de Tasa (Rate Limiting):**
   - **General:** Máximo 120 peticiones por minuto por IP para evitar sobrecarga del servidor.
   - **Autenticación:** Máximo 5 intentos por minuto en `/api/auth/login` y `/api/auth/register` para mitigar ataques de fuerza bruta.
3. **CORS Controlado por Entorno:**
   - Lista blanca de dominios permitidos (`http://localhost:4200`, `http://localhost:3000`, etc.) configurable mediante la variable de entorno `ALLOWED_ORIGINS`.
4. **Protección contra Condiciones de Carrera en Stock:**
   - Se reforzó la transacción atómica de `OrderService.createOrder` validando en el mismo instante del decremento que el inventario no caiga por debajo de 0, abortando la transacción automáticamente si otro comprador adquiere las últimas unidades en el mismo milisegundo.

---

## 2. 📁 Archivos Modificados y Creados

- **[NEW]** `backend/src/middlewares/security.middleware.ts`: Configuración centralizada de `express-rate-limit`.
- **[MODIFY]** `backend/src/app.ts`: Inclusión de `helmet`, CORS restrictivo y rate limiter general.
- **[MODIFY]** `backend/src/routes/auth.routes.ts`: Protección de endpoints de login y registro con `authRateLimiter`.
- **[MODIFY]** `backend/src/services/order.service.ts`: Verificación atómica de stock en transacción.
- **[MODIFY]** `backend/package.json`: Incorporación de `helmet` y `express-rate-limit`.

---

## 3. 🧪 Validación y Pruebas

- **Compilación TypeScript:** Ejecutado `npx tsc --noEmit` con resultado `0 errores`.
- **Compatibilidad con Frontend:** Las rutas públicas de catálogo y la carga de imágenes `/uploads` continúan operando con total normalidad y fluidez.

---

## 4. 📖 Glosario de Conceptos para Desarrolladores Juniors

* **Helmet:** Es como ponerle un casco y chaleco antibalas a tu servidor web. Agrega automáticamente pequeñas etiquetas invisibles (cabeceras HTTP) que le indican al navegador web cómo bloquear ataques comunes como inyección de código o robo de datos.
* **Rate Limiting (Control de Frecuencia):** Funciona como el molinete de una estación: no deja que una sola persona pase corriendo 50 veces por segundo. Si un robot intenta probar 100 contraseñas por segundo, después del quinto intento queda bloqueado por un minuto.
* **Rollback Transaccional:** Si la base de datos detecta un error dentro de una transacción (por ejemplo, el stock llegó a -1), automáticamente "rebobina la cinta" y anula todos los pasos previos como si nada hubiera ocurrido, manteniendo la base de datos 100% limpia y coherente.
