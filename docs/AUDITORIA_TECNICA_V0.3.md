# Auditoría Técnica — El Rincón del Mate v0.3

**Fecha:** 8 de noviembre de 2026
**Alcance:** re-auditoría completa tras 6 commits nuevos (`f1f6526f..202fc459`).
**Método:** lectura del código en `HEAD`, no de la documentación. Diff acotado contra la auditoría anterior.

| Commit | Cambio |
| --- | --- |
| `efd03ba9` | Servicio de correo y notificaciones de pedido |
| `c147e7b4` | Integración Supabase Auth + script de sincronización de admin |
| `43562abc` | Notificaciones reactivas de estado + anti-spam |
| `f77893fc` | Guía de arquitectura |
| `c99f9cda` | Navegación por clic en imágenes |
| `202fc459` | Notificaciones de carrito + rediseño del hero |

**Veredicto:** el trabajo nuevo es sólido en lo visual y en la experiencia (SONDEO reactivo, correos HTML cuidados, rediseño del hero), pero **no corrigió ninguno de los tres críticos** y añadió una superficie nueva de riesgo en correo y autenticación. Sigue sin haber una sola prueba automatizada. La brecha entre lo que la documentación afirma y lo que el código hace **creció**: hay 100 documentos en `docs/` y varios describen comportamientos que no coinciden con la implementación.

---

## 1. Estado de los hallazgos de la v0.2

| ID | Hallazgo | Estado |
| --- | --- | --- |
| C-01 | Contraseña fija `TempPassword_2026!` en Supabase Auth | **ABIERTO** — `profile.service.ts:107` |
| C-02 | Endpoint público de categoría devuelve `Product` con `cost` | **ABIERTO** — `category.service.ts:12-22` |
| C-03 | Reportes suman pedidos cancelados como ingreso | **ABIERTO** — `stats.service.ts:13`, `report.service.ts:67,95,152,239` |
| A-01 | `active` no se puede desactivar (`z.coerce.boolean`) | **ABIERTO** — `product.validator.ts:29` |
| A-02 | `GET /api/orders/:id` público con datos del comprador | **MITIGADO** — ahora devuelve DTO sanitizado sin PII ni comprobante |
| A-03 | Comprobantes servidos sin autenticación | **ABIERTO** — `app.ts:52` (`/uploads` estático) |
| A-04 | Cero pruebas automatizadas | **ABIERTO** — 0 archivos `*.spec.*` / `*.test.*` |
| A-05 | Migración inicial desincronizada con el schema | **ABIERTO** — `DOUBLE PRECISION`, sin `Product.images` |
| M-01 | `ADMIN_EMAIL` con dos defaults distintos | **CORREGIDO en la app** (ambos `admin@elrincondelmate.com`) pero **incoherente en el script** (`syncAdminUser.ts` usa `rincondelmatebo@gmail.com`) |
| M-02 | Token legacy confía en el payload completo | **ABIERTO** — `auth.middleware.ts` sigue haciendo `req.user = decoded` |
| M-03 | Supabase URL y publishable key hardcodeadas; `service_role` cae a anon | **ABIERTO** y agravado (ver N-06) |
| M-05 | Frontend envía `limit`, backend lee `pageSize` | **ABIERTO** — `api.service.ts` sigue enviando `limit` |
| M-12 | README pide `.env.example` que no existe | **ABIERTO** — solo hay `backend/.env` |

**Lo positivo del diff:** el endpoint de pedido ahora sí distingue admin de público (`order.service.ts`, DTO con `product.name` e `imageUrl` únicamente), el correo tiene versión texto plano junto al HTML, el almacenamiento exige `SUPABASE_SERVICE_ROLE_KEY` en producción y la imagen del comprobante se libera al borrar el pedido. La máquina de estados y las transacciones de stock siguen intactas.

---

## 2. Hallazgos nuevos

### N-01 · Alto — Elevación de rol por correo con un default de dominio ajeno

**Evidencia:** `auth.service.ts:89`
```ts
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').trim().toLowerCase();
...
} else if (isEmailAdmin && user.role !== 'ADMIN') {
  user = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
```
El registro público (`POST /api/auth/register`) crea usuarios en Supabase Auth. Si `ADMIN_EMAIL` no está definido (o tiene una errata) en producción, el correo privilegiado pasa a ser `admin@elrincondelmate.com`, un buzón que **no pertenece al negocio** (el real es `rincondelmatebo@gmail.com`, según el propio README). Quien consiga registrar y confirmar esa dirección — el README incluso enseña a activar "Auto Confirm" para evitar el error de correo no confirmado — obtiene `role: 'ADMIN'` **persistente en la base de datos** al iniciar sesión, y el middleware `authenticateToken` volverá a reconocerlo en cada petición.

**Riesgo:** toma de control del panel administrativo (pedidos, comprobantes, precios, costos, inventario) sin explotar ninguna vulnerabilidad de memoria ni de inyección: solo configurar el correo.

**Remediación:** eliminar los defaults hardcodeados y **abortar el arranque** si `ADMIN_EMAIL` falta (igual que ya se hace con `JWT_SECRET` en `env.ts`). Mejor aún: dejar de derivar el rol desde una variable de entorno en tiempo de petición y confiar solo en `User.role` en base de datos, con el script de sincronización como único mecanismo de elevación.

### N-02 · Alto — Inyección de HTML en los correos transaccionales

**Evidencia:** `email.service.ts` (`generateNewOrderAdminHtml`, `generatePaymentStatusHtml`)
```ts
const clientName = client.name || 'Cliente';
const clientNotes = order.notes || 'Sin notas especiales.';
... `<strong>${clientName}</strong>` ... `"${clientNotes}"`
```
Todos los valores interpolados son **controlados por quien hace el pedido**: `clientName`, `address`, `city`, `phone`, `notes` y el nombre del producto. No hay escape. Un pedido con

```
notes: <a href="https://sitio-falso">Ver comprobante</a>
```

inserta un enlace clicable en el correo que llega a la bandeja del dueño, desde la dirección legítima del negocio (`from: "El Rincón del Mate" <admin>`). Es el vector clásico de phishing con la marca prestada, y el mismo texto se replica en el correo al cliente cuando el administrador reenvía la nota.

**Remediación:** una función `escapeHtml()` aplicada a todo valor de usuario antes de interpolarlo (o plantillas con escape automático). En la versión texto plano no hace falta, pero conviene recortar saltos de línea en campos cortos.

### N-03 · Alto — Búsqueda de usuario en Supabase limitada a la primera página

**Evidencia:** `profile.service.ts:88-93`
```ts
const { data: listData } = await supabaseAdmin.auth.admin.listUsers();  // 50 usuarios por defecto
const supabaseUser = listData?.users?.find(u => u.email?.toLowerCase() === existingUser.email.toLowerCase());
...
} else {
  const targetPassword = data.password || 'TempPassword_2026!';
  await supabaseAdmin.auth.admin.createUser({ email: targetEmail, password: targetPassword, ... });
}
```
`listUsers()` devuelve **solo la primera página (50 usuarios)**. A partir del usuario 51, el `find` falla, el flujo entra en la rama "no existía" y **crea un usuario duplicado en Supabase Auth con la contraseña fija**. El usuario real conserva sus credenciales; el nuevo registro queda huérfano y con contraseña conocida por cualquiera que lea el código. Además, la lista completa de usuarios se descarga en cada guardado de perfil: latencia y consumo innecesarios.

**Remediación:** guardar `supabaseAuthId` en `User` al registrarse y usar `getUserById`; si se necesita búsqueda por correo, paginar con `page`/`perPage` hasta encontrarlo. Y **eliminar el fallback de contraseña fija**: si el usuario no existe en Supabase, es un error de consistencia, no una oportunidad de crearlo.

### N-04 · Alto — El ciclo logístico del pedido es inalcanzable desde el panel

**Evidencia:** `admin-orders.component.html` (selector de estado) y `admin-orders.component.ts` (`normalizeStatus`)
```html
<option value="PENDING_PAYMENT_VERIFICATION">Pendiente de verificación</option>
<option value="PAID">Aprobado</option>
<option value="PAYMENT_REJECTED">Rechazado</option>
```
```ts
if (['PAID', 'APPROVED', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) return 'PAID';
```
El backend implementa una máquina de estados completa (`PENDING_PAYMENT_VERIFICATION → PAID → PACKING → SHIPPED → DELIVERED`), pero la interfaz **solo expone tres estados** y colapsa `PACKING`, `SHIPPED` y `DELIVERED` en "Aprobado". Consecuencias:

1. Ningún pedido puede marcarse como empaquetado, enviado o entregado desde la web: hay que llamar a la API a mano.
2. Un pedido entregado se muestra como "Aprobado", indistinguible de uno recién pagado.
3. Si el administrador abre un pedido entregado y pulsa "Actualizar", el formulario envía `PAID` y el backend responde "Transición no permitida".

**Remediación:** poblar el selector con los siete estados y deshabilitar los que no sean transiciones válidas desde el estado actual (la lista ya existe en el backend; conviene exponerla). No normalizar el estado para mostrarlo.

### N-05 · Medio-Alto — Cancelar un pedido pagado no anula el ingreso

**Evidencia:** `order.service.ts` (`updateOrderStatus`)
```ts
} else if (newStatus === 'PAYMENT_REJECTED') {
  paymentStatus = 'REJECTED';
  ...
}
```
La transición `PAID → CANCELLED` es válida, pero solo `PAYMENT_REJECTED` degrada el pago. Un pedido cancelado después de cobrar mantiene `payment.status = 'APPROVED'` y `paymentStatus = 'APPROVED'`, así que **sigue sumando en dashboard, reportes de ventas, ganancias, demanda y métricas del panel** aunque su stock ya se haya restaurado. Es una instancia concreta de C-03: aun filtrando por `order.status`, el dato de pago seguiría mintiendo.

**Remediación:** al pasar a `CANCELLED`, marcar el pago como `REJECTED` (o introducir `REFUNDED`) y filtrar los reportes por `status IN (PAID, PACKING, SHIPPED, DELIVERED)`.

### N-06 · Medio — El cliente "admin" de Supabase degrada silenciosamente a anon

**Evidencia:** `config/supabase.ts:13-16`
```ts
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, ...);
```
Si falta la clave `service_role`, `supabaseAdmin` se construye con la clave pública. Las llamadas de administración (`auth.admin.listUsers`, `createUser`, `storage.remove`) fallan con errores opacos en lugar de detenerse, y `FileStorageService` cree estar en la nube (`isCloudConfigured` sí valida la variable, pero el cliente ya está contaminado). Sumado a las credenciales hardcodeadas como fallback, el proyecto arranca "funcionando" en un estado incoherente.

**Remediación:** validar en `env.ts`; si `NODE_ENV === 'production'` y falta `SUPABASE_SERVICE_ROLE_KEY`, abortar. Eliminar la URL y la publishable key del código.

### N-07 · Medio — En producción, si falta SMTP, los correos se pierden sin aviso

**Evidencia:** `email.service.ts` (`getTransporter`)
```ts
if (!this.transporter) {
  const testAccount = await nodemailer.createTestAccount();  // Ethereal
  ...
}
```
Sin `SMTP_USER`/`SMTP_PASS`, el servicio crea una cuenta de prueba en la nube de Ethereal y "envía" ahí. El pedido se registra como notificado, el administrador ve "Correo enviado exitosamente", y **el cliente nunca recibe nada**. En desarrollo es cómodo; en producción es una falla silenciosa de un canal crítico (confirmación de compra y rechazo de pago).

**Remediación:** permitir Ethereal solo con `NODE_ENV !== 'production'`; en producción, fallar explícitamente y registrar el error para que el panel muestre "no se pudo notificar".

### N-08 · Medio — La sesión caduca en una hora y no se renueva

**Evidencia:** el backend devuelve `authData.session.access_token` y el frontend lo guarda en `sessionStorage` (`mate_token`). No existe `refreshSession`, `onAuthStateChange` ni manejo de `expires_at` en ningún archivo del proyecto.

El access token de Supabase dura ~60 minutos. Pasado ese tiempo, `supabase.auth.getUser(token)` falla y el middleware responde `403` "Token inválido o expirado", mientras la UI sigue creyendo que hay sesión (`isAuthenticated()` solo comprueba que el string exista). El administrador pierde el trabajo a media carga del pedido y el mensaje no explica que debe volver a entrar.

**Remediación:** guardar también el `refresh_token`, renovar antes de expirar (o en el interceptor ante 401/403) y, si el refresco falla, hacer logout limpio con un mensaje claro.

### N-09 · Medio — Cambio de correo sin verificar propiedad y sin rollback

**Evidencia:** `profile.service.ts:44-46,73`
```ts
supabaseUpdates.email = normalizedEmail;
supabaseUpdates.email_confirm = true; // Auto-confirmación instantánea sin fricción
```
`email_confirm: true` marca como confirmada una dirección que el usuario **nunca demostró poseer**. Se puede poner el correo de un tercero: la cuenta queda asociada a esa dirección, la persona real no puede registrarse y el titular del buzón puede iniciar sesión con la contraseña que el atacante ya conoce si además la cambió en la misma operación. Tampoco se pide la contraseña actual (C-01).

Además, el orden es Supabase primero y Prisma después: si la escritura en PostgreSQL falla, las credenciales ya cambiaron y no hay compensación.

**Remediación:** exigir la contraseña actual; enviar correo de verificación en lugar de auto-confirmar; actualizar primero PostgreSQL y revertir (o reintentar) si Supabase falla.

### N-10 · Medio — El sondeo consume la cuota del rate limit

**Evidencia:** `admin-orders.component.ts` (`interval(10000)`), `order-detail.component.ts` (`interval(4000)`).

El panel consulta la lista completa de pedidos cada 10 s (≈6 req/min por pestaña) y la página pública del pedido cada 4 s (15 req/min). El limitador general permite 120 req/min **por IP**. Dos o tres pestañas del panel abiertas detrás de una misma IP (oficina, CGNAT móvil) se acercan al límite, y el usuario ve errores de "demasiadas solicitudes" que no puede asociar al sondeo. El cálculo además se hace sobre listas completas, sin paginación de servidor.

**Remediación:** pausar el sondeo cuando la pestaña no está visible (`document.hidden`), subir el intervalo a 30 s y añadir `ETag`/`If-None-Match` o un endpoint ligero `GET /api/orders/:id/status`.

### N-11 · Bajo — Remitente del correo desalineado con la cuenta SMTP

**Evidencia:** `email.service.ts` (`getAdminSender`) toma `findFirst({ role: 'ADMIN' })` como `from`, mientras la autenticación SMTP usa `SMTP_USER`.

Si ambos no coinciden (caso normal con Gmail), el servidor reescribe el remitente o el mensaje cae en spam por SPF/DMARC. `findFirst` sin `orderBy` además elige un administrador arbitrario si hay más de uno.

**Remediación:** usar siempre `SMTP_USER` como remitente y `ADMIN_EMAIL` como `replyTo`, o configurar un dominio con SPF/DKIM propio.

### N-12 · Bajo — Documentación que contradice al código

Hay **100 archivos** en `docs/`. Varios afirman cosas que ya no son ciertas: `PLAN_MAESTRO_DESPLIEGUE_PRODUCCION.md` publica un `JWT_SECRET` literal, `PLAN_MIGRACION_AUTENTICACION_SUPABASE_AUTH.md` describe la autenticación JWT propia que ya no se usa, y el README explica `cp .env.example .env` sobre un archivo inexistente. Un lector nuevo no puede distinguir el estado real del histórico.

**Remediación:** un `docs/ESTADO_ACTUAL.md` como única fuente de verdad, y mover los planes cerrados a `docs/archive/`.

---

## 3. Fortalezas que deben preservarse

- Transacciones atómicas con verificación de `stock < 0` **después** del decremento: la protección contra sobreventa es real, no cosmética.
- `ALLOWED_STATUS_TRANSITIONS` explícito, con restauración y re-reserva de inventario en ambos sentidos.
- Recálculo de precios y costos en el servidor; el carrito del cliente nunca define importes.
- Validación Zod en todas las entradas, con mensajes en español y `pageSize` acotado a 100.
- Magic bytes además del MIME declarado, y `upsert` con nombre de archivo aleatorio.
- DTO público de pedido correctamente sanitizado (mejora real de esta iteración).
- `JWT_SECRET` obligatorio con mínimo de 32 caracteres: el servidor se niega a arrancar sin él.
- Helmet + CORS con lista blanca + rate limit específico en `/auth` (5/min).
- Correos con versión texto plano, `replyTo` y cabecera de referencia por pedido: buena higiene antispam.
- PDF con verificación de propiedad (admin o dueño del pedido).

---

## 4. Plan de remediación sugerido

### Fase 1 — Antes de abrir la tienda (1–2 días)
1. C-02: `select` explícito en `category.service.getBySlug` y DTO público compartido.
2. C-03 + N-05: filtrar reportes por estado de pedido y degradar el pago al cancelar.
3. A-01: `active` con `z.enum(['true','false']).transform(v => v === 'true')` o `z.preprocess`.
4. N-01: quitar defaults de `ADMIN_EMAIL` y abortar si falta.
5. C-01 + N-03 + N-09: eliminar `TempPassword_2026!`, buscar por `supabaseAuthId`, exigir contraseña actual.

### Fase 2 — Operación confiable (3–5 días)
6. N-02: escape de HTML en plantillas de correo.
7. N-04: selector de estados completo y transiciones válidas desde el backend.
8. A-03: servir comprobantes con URL firmada o endpoint autenticado.
9. N-07 + N-06: fallar explícito sin SMTP y sin `service_role` en producción.
10. N-08: refresco de sesión en el interceptor.

### Fase 3 — Deuda estructural (1–2 semanas)
11. A-05: regenerar la migración inicial o añadir migraciones incrementales hasta igualar el schema; usar `migrate deploy` en el pipeline.
12. A-04: primera suite: `parsePaginationParams`, `ALLOWED_STATUS_TRANSITIONS`, `validateImageMagicBytes`, `active` y el recálculo de totales. Con Vitest/Jest y Supertest contra una base efímera.
13. M-02: eliminar el fallback de JWT legacy.
14. M-05 + N-10: unificar paginación (`page`/`pageSize` de punta a punta) y sondeo incremental.
15. N-12: `ESTADO_ACTUAL.md` y archivo de planes cerrados.

---

## 5. Verificaciones ejecutadas

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| Tipado backend | `npx tsc --noEmit -p tsconfig.json` | **0 errores** (exit 0) |
| Tipado frontend | `npx tsc -p tsconfig.app.json --noEmit` | **0 errores** (exit 0) |
| Pruebas automatizadas | búsqueda de `*.spec.*`, `*.test.*`, `__tests__`, Cypress, Playwright | **0 archivos** |
| Scripts de prueba | `backend/package.json`, `frontend/package.json` | **no existe `test`** |
| Migración vs schema | `migration.sql` de `20260907212748_init` | `DOUBLE PRECISION` en todos los importes y **sin la columna `Product.images`** |
| `.env.example` | `ls -a backend` | **no existe** |
| Secretos versionados | `git ls-files` | solo `migration.sql`; `.env` y `DB-backups/` fuera de Git |

**No ejecutado:** pruebas de integración, E2E ni carga (no hay infraestructura). Tampoco se levantó el servidor: la auditoría fue de lectura estática sobre `HEAD`, por lo que los hallazgos de comportamiento (N-04, N-05, N-07) están derivados del código, no observados en ejecución.
