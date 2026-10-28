# 🛡️ Plan de Corrección de Vulnerabilidades, Seguridad y Estabilidad v0.1

**Fecha de Auditoría:** 28 de Octubre de 2026  
**Proyecto:** El Rincón del Mate (Backend & Frontend)  
**Módulos Afectados:** Reportes PDF, Almacenamiento Supabase, Seed de Base de Datos, Dependencias npm, Repositorio Git  
**Estado:** ✅ Implementación Completada y Validada (0 Errores)  

---

## 1. 🎯 Diagnóstico Detallado de los Hallazgos

A partir del análisis técnico y la verificación manual del código fuente, se confirmaron los 5 hallazgos críticos detectados:

### 1.1. Fuga de Datos Personales en PDF de Pedidos (`GET /api/reports/orders/:id/pdf`)
* **Ubicación:** `backend/src/routes/report.routes.ts` (línea 8) y `backend/src/utils/pdfGenerator.ts`.
* **Problema:** El endpoint `router.get('/orders/:id/pdf', ReportController.downloadOrderPdf);` no cuenta con ningún middleware de autenticación (`authenticateToken`).
* **Impacto:** Cualquier persona en internet que conozca o pruebe identificadores de pedido puede descargar un documento PDF oficial que incluye nombre completo del cliente, correo electrónico, número de teléfono, dirección exacta de entrega y número de documento de identidad (CI/NIT). Mientras que la ruta estándar `GET /api/orders/:id` sanitiza estos datos para usuarios no administradores, el endpoint de PDF los expone sin restricción.

### 1.2. Degradación Silenciosa y Pérdida de Imágenes en Render (`FileStorageService`)
* **Ubicación:** `backend/src/utils/fileStorageService.ts` (líneas 106-113).
* **Problema:** En el método `saveFile`, si la subida a Supabase Storage falla (por claves faltantes, token expirado o caída de red), el sistema simplemente ejecuta un `console.warn` y guarda la imagen en el disco local (`uploads/`).
* **Impacto:** En plataformas en la nube como Render o Railway, el disco es **efímero** (se destruye y reinicia desde cero con cada nuevo despliegue o reinicio del servidor). Las fotos de comprobantes de pago de los clientes y las imágenes de productos desaparecen físicamente, dejando URLs rotas en la base de datos sin que nadie en el equipo reciba una alerta de error.

### 1.3. Script de Sembrado (`seed.ts`) Inseguro y No Idempotente
* **Ubicación:** `backend/prisma/seed.ts`.
* **Problemas:**
  1. **Contraseña por Defecto:** Si no existe la variable `ADMIN_PASSWORD`, asigna `'ChangeMeInProduction_2026!'`. En producción, esto permitiría que un atacante tome control total del sistema.
  2. **QR Falso Activo:** Inserta automáticamente un registro de QR de pago bancario usando una fotografía genérica de Unsplash con `active: true`. Un cliente real en producción intentaría pagar escaneando una foto de stock.
  3. **No Idempotencia:** Cada vez que se corre `prisma db seed`, se ejecuta `prisma.paymentQrConfig.create` y `prisma.inventoryMovement.create`, acumulando múltiples QRs y duplicando los registros de inventario inicial.
  4. **Enlace Local en QRs de Productos:** Genera códigos QR apuntando a `http://localhost:4200/productos/...` en lugar de utilizar la URL pública del frontend (`FRONTEND_URL`).

### 1.4. Vulnerabilidades de Dependencias y Ruptura de Compilación por Zod 4
* **Ubicación:** `backend/package.json` y `backend/package-lock.json`.
* **Problema:**
  - Al ejecutar `npm audit fix --force` previamente, `zod` fue actualizado a la versión `^4.6.7`. Zod versión 4 introduce cambios incompatibles (*breaking changes*) eliminando propiedades como `required_error` y `errorMap`.
  - Como consecuencia directa, el backend **no compila** (`npx tsc --noEmit` arroja más de 30 errores de tipos en todos los validadores).
  - Asimismo, Express y sus dependencias internas (`proxy-addr` y `body-parser`) requieren una actualización compatible para resolver la vulnerabilidad que permite falsear la IP del cliente y eludir el limitador de tasa (*rate limit*).

### 1.5. Respaldo Binario de la Base de Datos Rastreado en Git (`mate-DB-backup-0.1.sql`)
* **Ubicación:** `DB-backups/mate-DB-backup-0.1.sql` y `.gitignore`.
* **Problema:** El archivo es un volcado binario de PostgreSQL (`PGDMP`) de 40.5 KB que contiene esquemas y registros reales, incluyendo la tabla `User` con correos y los hashes bcrypt de las contraseñas.
* **Impacto:** El archivo está registrado activamente en el índice de Git y no figura en `.gitignore`. Si el repositorio se encuentra en GitHub o es compartido, las credenciales están expuestas.

---

## 2. 🛠️ Plan de Implementación Paso a Paso

### Fase 1: Blindaje del Repositorio y Variables Sensibles
1. Agregar `DB-backups/` y `*.sql` al archivo `.gitignore` raíz.
2. Desvincular el archivo de Git con `git rm --cached DB-backups/mate-DB-backup-0.1.sql`.
3. Emitir advertencia de seguridad para rotación de credenciales de administrador en producción.

### Fase 2: Corrección de Dependencias y Compilación TypeScript
1. Revertir `zod` a `^3.23.8` en `backend/package.json` para restaurar la compatibilidad de todos los esquemas de validación.
2. Actualizar `express` a `^4.21.2` (o configurar `overrides` para `proxy-addr: ^2.0.8` y `body-parser: ^1.20.3`).
3. Ejecutar `npm install` en backend y verificar compilación limpia (`npx tsc --noEmit`).

### Fase 3: Seguridad en Reportes PDF (`report.routes.ts` & `report.controller.ts`)
1. Proteger `GET /api/reports/orders/:id/pdf` con `authenticateToken`.
2. Validar que el usuario solicitante sea un administrador (`ADMIN`) o el cliente propietario del pedido (`order.clientId === req.user.id`). En caso contrario, responder con `403 Forbidden`.

### Fase 4: Manejo Estricto de Almacenamiento en Producción (`FileStorageService`)
1. Modificar `FileStorageService.saveFile` para que, cuando `NODE_ENV === 'production'`:
   - Si faltan las variables de Supabase (`SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`), lance un `AppError.internal` inmediato.
   - Si la petición de subida a Supabase falla, lance un error impidiendo que la transacción continúe en silencio.
   - Mantener el almacenamiento local en disco únicamente cuando estemos en entorno de desarrollo (`development`).

### Fase 5: Idempotencia y Blindaje del Seed (`backend/prisma/seed.ts`)
1. Validar que en producción sea estrictamente obligatorio definir `process.env.ADMIN_PASSWORD` (no usar contraseñas por defecto).
2. Evitar la creación de QRs falsos de Unsplash en producción; en desarrollo, crearlo solo si no existe ninguno activo previamente.
3. Evitar movimientos de inventario duplicados revisando si ya existe un movimiento `INITIAL` para cada producto.
4. Usar `process.env.FRONTEND_URL || 'http://localhost:4200'` para la URL codificada en los QR de productos.

---

## 3. 📖 Glosario de Conceptos para Desarrolladores Juniors

Para que todo el equipo comprenda con claridad los términos utilizados en esta auditoría:

* **Endpoint:** Es una dirección o "puerta de entrada" en el servidor (como `/api/pedidos/1`) a la cual una aplicación envía una solicitud para consultar o guardar información.
* **Middleware de Autenticación (`authenticateToken`):** Imagina a un guardia de seguridad en la puerta de un edificio. Revisa tu identificación (en este caso, un token JWT) antes de dejarte pasar. Si no tienes identificación o está vencida, no te permite entrar.
* **Sanitización de Datos / DTO:** Es como tachar con marcador negro los datos privados (número de carnet de identidad, dirección o teléfono) en una fotocopia antes de entregársela al público, asegurando que solo se comparta lo estrictamente necesario.
* **Disco Efímero (Ephemeral Storage):** Servidores en la nube como Render funcionan como pizarras acrílicas: cada vez que se despliega una nueva versión o el servidor se reinicia, la pizarra se borra por completo. Si guardas fotos directamente en el disco de Render, se perderán para siempre en el próximo deploy. Por eso se debe usar un servicio externo permanente como Supabase Storage.
* **Idempotencia:** Propiedad que significa que puedes ejecutar una acción una o cien veces y el resultado final siempre será exactamente el mismo, sin duplicar datos ni causar errores colaterales.
* **Hash Bcrypt:** Una contraseña nunca debe guardarse en texto plano. Un hash es el resultado de pasar la contraseña por una "trituradora matemática" irreversible. Aunque alguien vea el hash, no puede adivinar la contraseña original fácilmente, pero con suficiente tiempo y poder de cómputo (o diccionarios de claves) podría intentar descifrarla si el archivo de la base de datos se filtra.
* **pg_dump:** Es la herramienta oficial de PostgreSQL para crear una "copia de seguridad congelada" de toda tu base de datos (tablas, columnas, usuarios y registros) en un solo archivo.
* **Rate Limiting & Trust Proxy (`proxy-addr`):** El Rate Limiting limita cuántas peticiones puede hacer una persona por segundo para que un robot no sature el servidor. Para saber quién hace la petición, el servidor mira su dirección IP. Si el componente `proxy-addr` tiene una falla de seguridad, un atacante puede inventarse una IP falsa en cada petición y el servidor creerá que son miles de personas distintas, saltándose el límite por completo.
* **Breaking Change (Cambio Disruptivo):** Es cuando una librería se actualiza a una nueva versión importante (como pasar de Zod 3 a Zod 4) y los creadores cambian el nombre de las funciones o la forma en que se escriben las reglas. El código viejo deja de funcionar de inmediato y el compilador lanza errores.

---

## 4. ✅ Registro de Cambios Implementados y Validación

1. **Blindaje de Copias de Seguridad en Git:**
   - `.gitignore` actualizado con reglas de exclusión para `DB-backups/`, `*.sql`, `*.dump` y `*.tar`.
   - `DB-backups/mate-DB-backup-0.1.sql` desvinculado del índice de Git conservando el archivo físico en disco local.
2. **Estabilización de Dependencias:**
   - `zod` fijado en `^3.23.8` en `backend/package.json`, eliminando todas las incompatibilidades de tipos.
   - `express` actualizado a `^4.21.2` con `overrides` de `proxy-addr: ^2.0.8` y `body-parser: ^1.20.3` para mitigar vulnerabilidades sin riesgo de rotura.
   - Compilación verificada: `npx tsc --noEmit` completado con **0 errores**.
3. **Protección de Reportes PDF:**
   - `backend/src/routes/report.routes.ts`: `authenticateToken` incorporado a `GET /orders/:id/pdf`.
   - `backend/src/services/report.service.ts`: verificación de rol `ADMIN` o coincidencia de `clientId`/`email` del cliente autenticado.
4. **Resiliencia de Almacenamiento en Producción:**
   - `backend/src/utils/fileStorageService.ts`: verificación de `NODE_ENV === 'production'` que impide silenciosamente guardar en disco efímero local ante fallos de Supabase.
   - Soporte de eliminación remota en buckets de Supabase añadido a `deleteFile`.
5. **Robustez e Idempotencia en Sembrado:**
   - `backend/prisma/seed.ts`: aborto estricto si falta `ADMIN_PASSWORD` en producción.
   - Creación de QR demo omitida en producción y protegida contra duplicados en desarrollo.
   - Movimientos de inventario `INITIAL` protegidos con verificación de existencia previa.
   - Enlaces QR de productos configurados dinámicamente con `FRONTEND_URL`.
6. **Documentación del Proyecto:**
   - `backend/.env.example` actualizado con variables de Supabase y enlaces frontend.
   - `README.md` actualizado con las nuevas políticas de seguridad y variables requeridas.


