# 🔬 Auditoría Técnica Integral — El Rincón del Mate v0.1

**Fecha:** 2 de noviembre de 2026
**Alcance:** Backend (`backend/`), Frontend (`frontend/`), esquema Prisma, configuración, dependencias y documentación.
**Stack real verificado:** Angular 19.2 (standalone) · Express 4.22 · Prisma 5.22 / PostgreSQL · Supabase Auth + Storage · PDFKit · Nodemailer.

---

## 0. Resumen ejecutivo

El proyecto está **funcionalmente completo y por encima del promedio** para un e-commerce de este tamaño: transacciones atómicas, máquina de estados de pedidos, validación Zod, magic bytes, Helmet, rate limiting, lista blanca CORS y protección de costos en las rutas públicas de productos.

Sin embargo, la auditoría encontró **3 problemas críticos**, **5 altos** y **13 medios** que afectan dinero, inventario o cuentas de usuario. Los dos más graves son:

1. **Toma de cuenta potencial** en el módulo de perfil (`TempPassword_2026!` + cambio de correo sin re-autenticación).
2. **Fuga del costo interno** de todos los productos a través del endpoint público de categorías.
3. **Reportes financieros inflados:** los pedidos cancelados siguen contando como ingresos, y borrar un pedido `DELIVERED` repone stock que ya se consumió.

**Veredicto:** apto para operar con volumen bajo, **no apto para producción abierta al público** hasta corregir C-01, C-02 y C-03.

---

## 1. Verificaciones ejecutadas

| Verificación | Comando | Resultado |
| :--- | :--- | :--- |
| Compilación backend (TS estricto) | `npx tsc --noEmit -p tsconfig.json` | ✅ 0 errores |
| Compilación frontend (TS app) | `npx tsc -p tsconfig.app.json --noEmit` | ✅ 0 errores |
| Pruebas automatizadas | `find … -iname "*.spec.ts" -o -iname "*.test.ts"` | ❌ **0 archivos** |
| Secretos versionados | `git ls-files \| grep -Ei "\.env\|backup\|\.sql"` | ✅ solo la migración inicial |
| Sincronía migración ↔ schema | lectura de `migration.sql` vs `schema.prisma` | ❌ divergentes |
| Dependencias instaladas | `node -e require(.../package.json)` | nodemailer 10.3.1 · multer 1.4.5-lts.2 · express 4.22.3 · prisma 5.22.0 |

No se ejecutaron pruebas de integración ni E2E porque el proyecto **no tiene infraestructura de pruebas**.

---

## 2. Hallazgos críticos

### C-01 · Toma de cuenta vía contraseña fija en Supabase Auth
**Evidencia:** `backend/src/services/profile.service.ts:107`

```ts
const targetPassword = data.password || 'TempPassword_2026!';
```

Si el usuario existe en PostgreSQL pero no en Supabase Auth, al cambiar **solo el correo** se crea una cuenta en Supabase con la contraseña `TempPassword_2026!` y se le asigna el correo nuevo. Cualquier persona que conozca esa constante puede iniciar sesión como ese usuario. Agravante: el cambio de correo/contraseña no exige la contraseña actual (`PUT /api/profile`), por lo que un token robado (XSS en `sessionStorage`) basta para apropiarse de la cuenta.

**Remediación**
- Eliminar la contraseña por defecto: si el usuario no existe en Auth, abortar con error operativo y exigir flujo de invitación.
- Exigir `currentPassword` (y verificarla contra Supabase) antes de cambiar correo o contraseña.
- Invalidar sesiones tras el cambio (`auth.admin.signOut` / revocación de refresh tokens).

---

### C-02 · Fuga del costo interno en el catálogo público
**Evidencia:** `backend/src/routes/category.routes.ts:10-11` (público) → `backend/src/services/category.service.ts:12-22`

```ts
include: { products: { where: { active: true }, orderBy: { createdAt: 'desc' } } }
```

`getBySlug` devuelve el modelo `Product` **completo**, incluido `cost` (precio de compra). Las rutas de productos sí excluyen `cost` con `select` explícito, pero la de categorías no. Cualquier visitante puede leer el margen de todo el catálogo desde `GET /api/categories/:slug`.

**Remediación:** usar el mismo `select` público que `ProductService.getBySlug`/`getAll` (sin `cost`) o mapear un DTO. Añadir prueba de contrato que falle si `cost` aparece en respuestas públicas.

---

### C-03 · Contabilidad inconsistente: cancelaciones y borrados
**Evidencia:** `backend/src/services/stats.service.ts:13` y `backend/src/services/order.service.ts:530`

```ts
where: { payment: { status: 'APPROVED' } }                        // stats.service.ts:13
const shouldRestoreStock = order.status !== 'PAYMENT_REJECTED'
                        && order.status !== 'CANCELLED';           // order.service.ts:530
```

Dos defectos encadenados:

1. **Ingresos inflados:** al pasar un pedido pagado a `CANCELLED`, el pago permanece `APPROVED` y no existe filtro por estado de pedido. Ese pedido cancelado sigue sumando en `totalRevenue`, `netProfit`, `topSellingProducts`, `orderDistribution`, reportes de ventas/ganancias y pronóstico de demanda.
2. **Stock inflado:** `deleteOrder` repone inventario incluso si el pedido estaba `DELIVERED`, donde el descuento ya era definitivo. Borrar un pedido entregado regala unidades al stock. Además se destruye el comprobante de pago y la trazabilidad contable.

**Remediación**
- Filtrar reportes por `status: { in: ['PAID','PACKING','SHIPPED','DELIVERED'] }` (o `status: { notIn: ['CANCELLED','PAYMENT_REJECTED'] }`).
- Al cancelar un pedido pagado, marcar el pago como reembolsado/anulado (`PaymentStatus.REFUNDED`) en la misma transacción.
- En `deleteOrder`, restaurar stock solo para estados con reserva activa (`PENDING_PAYMENT_VERIFICATION`, `PAID`, `PACKING`, `SHIPPED`); impedir el borrado físico de pedidos `DELIVERED` o convertirlo en baja lógica.
- Centralizar la definición de "estado que cuenta como venta" en un único módulo para evitar divergencias entre `stats.service` y `report.service`.

---

## 3. Hallazgos altos

### A-01 · No se puede desactivar un producto (bug de coerción booleana)
**Evidencia:** `frontend/src/app/features/admin-products/admin-products.component.ts:475` + `backend/src/validators/product.validator.ts` (`active: z.coerce.boolean()`)

El formulario envía `active` como texto (`"true"`/`"false"`) dentro de `FormData`. `z.coerce.boolean()` aplica `Boolean("false") === true`, de modo que `validateBody` transforma `"false"` en `true`. El controlador vuelve a leer `req.body.active` ya transformado y guarda `true`.

**Efecto:** desactivar un producto desde el modal de edición no hace nada, y **cualquier edición reactiva un producto previamente desactivado**.

**Remediación:** usar `z.enum(['true','false']).transform(v => v === 'true')` o `z.preprocess`, y en el controlador comparar contra el valor ya normalizado. Añadir prueba unitaria del validador con `"false"`.

---

### A-02 · Consulta pública de pedidos sin autenticación
**Evidencia:** `backend/src/routes/order.routes.ts` (`router.get('/:id', optionalAuthenticateToken, …)`)

Cualquiera que conozca un `orderNumber` (`ORD-YYMMDD-XXXXXXXX`, 32 bits de entropía) ve estado, ítems, totales y motivo de rechazo. El número circula en correos, PDFs y en la URL `/pedido/:orderNumber`, por lo que se filtra por historial, capturas o *referrer*. No se exige correo ni token para el DTO público.

**Remediación:** exigir `authenticateToken` + verificación de propiedad (como ya hace el PDF), o emitir un token firmado de corta duración al confirmar el pedido. Si se mantiene público, aumentar la entropía a ≥128 bits y limitar la tasa por IP en esa ruta.

---

### A-03 · Comprobantes bancarios en almacenamiento público
**Evidencia:** `backend/src/app.ts` (`express.static('/uploads')`) y `FileStorageService.saveFile` → `getPublicUrl`

Los comprobantes de transferencia (nombre del titular, banco, monto, fecha) quedan accesibles por URL sin autenticación, en un bucket público o en `/uploads`. Las URL son adivinables (timestamp + 7 caracteres) y se comparten con el cliente por correo.

**Remediación:** bucket privado + URL firmada de corta duración servida por endpoint autenticado (`GET /api/payments/:id/proof` con verificación de propiedad). Para desarrollo local, servir `/uploads` detrás de `authenticateToken` o deshabilitarlo en producción.

---

### A-04 · Cero pruebas automatizadas
No existe ni un archivo `*.spec.ts`/`*.test.ts`, ni framework, ni script `test` en `backend/package.json` ni `frontend/package.json`. Para un sistema que descuenta stock, aprueba pagos y emite reportes contables, la ausencia de pruebas es un riesgo material: los bugs C-03, A-01 y M-01 habrían sido detectados por pruebas básicas de servicio.

**Remediación mínima (2–3 días):** Jest + `supertest` en backend cubriendo (a) máquina de estados y stock, (b) creación de pedido con carrito manipulado, (c) cálculo de métricas con pedidos cancelados, (d) validadores Zod. En frontend, pruebas unitarias de servicios (`CartService`, `AuthService`) y del validador de producto.

---

### A-05 · Migraciones Prisma desincronizadas con el esquema
**Evidencia:** `backend/prisma/migrations/20260907212748_init/migration.sql` vs `backend/prisma/schema.prisma`

| Elemento | Migración | Schema actual |
| :--- | :--- | :--- |
| `Product.price` / `cost` | `DOUBLE PRECISION` | `Decimal(12,2)` |
| `Product.images` | **no existe** | `String[] @default([])` |
| `Order.subtotal/total` | `DOUBLE PRECISION` | `Decimal(12,2)` |
| `OrderItem.unitPrice/unitCost/subtotal` | `DOUBLE PRECISION` | `Decimal(12,2)` |

Un `prisma migrate deploy` sobre una base limpia produce un esquema que **no coincide** con el que espera el código (sin `images`, con flotantes binarios). El proyecto depende hoy de `prisma db push` (visible en el checklist de despliegue), lo que impide versionar cambios de esquema y auditar migraciones.

**Remediación:** generar una migración base real (`prisma migrate diff --from-empty --to-schema-datamodel`) alineada al schema, marcarla como aplicada en la BD actual (`migrate resolve --applied`), y pasar el pipeline a `migrate deploy`. Documentar `decimal` como `Decimal` en los reportes (ya se hace con `Number(...)`).

---

## 4. Hallazgos medios

| ID | Hallazgo | Evidencia | Impacto | Remediación |
| :--- | :--- | :--- | :--- | :--- |
| M-01 | `ADMIN_EMAIL` con dos valores por defecto distintos | `auth.middleware.ts:28` (`…delmate.com`) vs `:76` (`…delmate2026.com`) | Un mismo usuario puede ser ADMIN en rutas con `optionalAuthenticateToken` y CLIENT en rutas protegidas (o viceversa) | Unificar en `env.ADMIN_EMAIL` obligatorio |
| M-02 | Token legacy confía en el payload completo | `auth.middleware.ts` (`jwt.verify` → `req.user = decoded`) | Un token firmado con `JWT_SECRET` que declare `role:'ADMIN'` otorga admin; no hay revocación | Eliminar la ruta legacy o forzar `role` desde la BD |
| M-03 | Credenciales e infraestructura hardcodeadas + fallback peligroso | `config/supabase.ts:4,10,16` | `service_role` cae silenciosamente a la clave anónima si falta la variable; URL/ref del proyecto expuesta en el repo | Exigir variables en producción (fail-fast) y eliminar los literales |
| M-04 | Cambio de contraseña sin re-autenticación; política inconsistente; `listUsers()` sin paginar | `profile.service.ts` | Escalada con token robado; contraseñas de 6 caracteres (registro exige 8); usuarios fuera de la primera página nunca sincronizan | Pedir contraseña actual, unificar mínimo 8, paginar `listUsers` |
| M-05 | Paginación de servidor no usada y parámetro desalineado | `api.service.ts` envía `limit`; controladores leen `pageSize`; componentes hacen `slice()` local | Se descarga todo el catálogo/pedidos/clientes y se pagina en el navegador; payload crece sin límite | Alinear `limit`↔`pageSize` y paginar en servidor con `PaginationComponent` |
| M-06 | Dashboard y reportes cargan todas las órdenes en memoria | `stats.service.ts` (`findMany` sin `select`/agregados); `report.service.ts` | Coste O(n) por visita al dashboard; riesgo de memoria al crecer el histórico | Usar `groupBy`/`aggregate` de Prisma y filtrar por fecha en SQL |
| M-07 | Sin idempotencia en creación de pedidos | `POST /api/orders` público | Doble clic o reintento crea dos pedidos y reserva stock dos veces | `Idempotency-Key` con tabla o restricción única temporal por cliente+carrito |
| M-08 | Comprobante huérfano si falla la transacción | `order.service.ts`: `saveFile` antes de `prisma.$transaction` | Archivos sin referencia consumen cuota de almacenamiento | Subir dentro de la transacción o borrar en el `catch` |
| M-09 | `Order.paymentStatus` es `String` libre existiendo `PaymentStatus` | `schema.prisma` | Deriva de valores (`'PAID'`, `'APPROVED'`, mayúsculas) sin restricción | Convertir a `enum PaymentStatus` |
| M-10 | Doble lockfile en ambos paquetes | `package-lock.json` + `pnpm-lock.yaml` en `backend/` y `frontend/` | Instalaciones no reproducibles entre entornos | Elegir pnpm (documentado) y eliminar `package-lock.json` |
| M-11 | `multer` 1.x (línea deprecada) | `backend/package.json` (`1.4.5-lts.1`, instalado `lts.2`) | Sin parches de seguridad futuros | Migrar a `multer` 2.x (API compatible) |
| M-12 | Onboarding roto por documentación desactualizada | `README.md` pide `cp .env.example .env`, pero **no existe `.env.example`**; auditorías previas dicen Angular 17 | Un nuevo desarrollador no puede levantar el proyecto siguiendo el README | Crear `.env.example` sin secretos y actualizar versiones |
| M-13 | Sin logging estructurado | 33 `console.log` en `backend/src` | Difícil diagnosticar en Render; se registran correos y rutas de archivos | Pino/Winston con niveles y redacción de PII |

---

## 5. Hallazgos bajos

| ID | Hallazgo | Remediación |
| :--- | :--- | :--- |
| B-01 | `credentials: true` combinado con comodín `'*'` en CORS (configuración inválida en navegadores) | Rechazar `'*'` cuando `credentials` esté activo |
| B-02 | `trust proxy: 1` asume exactamente un proxy | Documentar y ajustar si se añade CDN delante de Render |
| B-03 | El borrado de pedido elimina el comprobante físico (pérdida de evidencia) | Retención legal o baja lógica |
| B-04 | `logout()` solo limpia `sessionStorage`; la sesión de Supabase sigue válida hasta expirar | Llamar a `supabase.auth.signOut` en el backend |
| B-05 | `optionalAuthenticateToken` hace una llamada remota a Supabase + consulta a BD en cada request pública de producto | Cachear identidad corta o limitar a rutas de admin |
| B-06 | `createProduct` ignora `active`; `images: z.any()` sin validación | Respetar `active` y validar el arreglo de URLs |
| B-07 | 120 req/min por IP en toda la API puede afectar catálogos detrás de NAT corporativo/universitario | Limitar por ruta y elevar el techo en `GET` públicos |
| B-08 | Sin `.nvmrc` ni `engines`; Angular 19 exige Node ≥18.19 | Fijar versión de Node |
| B-09 | `payment-qr/:id/deactivate` no verifica que quede un QR activo | Advertir o impedir dejar el checkout sin QR |

---

## 6. Fortalezas verificadas (conservar)

- **Transacciones atómicas** en creación de pedido, cambio de estado y borrado, con `inventoryMovement` como bitácora.
- **Protección real contra sobreventa:** el decremento devuelve el valor actualizado y la transacción revierte si `stock < 0`.
- **Máquina de estados explícita** (`ALLOWED_STATUS_TRANSITIONS`) en lugar de updates libres.
- **Precios y costos recalculados en servidor**; el cliente solo envía `productId` + `quantity`.
- **Validación Zod** en auth, productos, clientes, categorías y pedidos, con mensajes en español.
- **Magic bytes** además del filtro MIME, y nombres de archivo regenerados con extensión derivada de la firma real.
- **Helmet, CORS con lista blanca, rate limit específico** en `/auth/login` y `/auth/register`.
- **Costos ocultos** en `GET /api/products` y `GET /api/products/:slug` (el fallo está solo en categorías).
- **PDF de pedido protegido** con verificación de propiedad por `userId` o correo.
- **`.env` y `DB-backups/` correctamente ignorados** y no versionados.
- **Seed idempotente** que bloquea contraseñas por defecto en producción y omite QRs ficticios.

---

## 7. Plan de remediación priorizado

### Fase 1 — Bloqueantes de producción (1–2 días)
1. C-01: eliminar `TempPassword_2026!`, exigir contraseña actual y revocar sesiones.
2. C-02: excluir `cost` del endpoint público de categorías.
3. C-03: filtrar cancelados en stats/reportes; corregir `shouldRestoreStock`; bloquear borrado de `DELIVERED`.
4. A-01: corregir la coerción de `active` y probar "desactivar" extremo a extremo.
5. A-02: proteger `GET /api/orders/:id`.

### Fase 2 — Endurecimiento y consistencia (3–5 días)
6. A-03: bucket privado y endpoint firmado para comprobantes.
7. A-05: migración base alineada + `migrate deploy` en el pipeline.
8. M-01, M-02, M-03: unificar `ADMIN_EMAIL`, eliminar token legacy, fail-fast de credenciales.
9. M-04: política de contraseñas y paginación de `listUsers`.
10. M-09: enum de `paymentStatus`.

### Fase 3 — Escalabilidad y calidad (1–2 semanas)
11. A-04: suite mínima de pruebas (servicios críticos).
12. M-05/M-06: paginación real en servidor y agregados SQL en métricas.
13. M-07/M-08: idempotencia y limpieza de archivos huérfanos.
14. M-10/M-11/M-12/M-13: lockfile único, multer 2.x, `.env.example`, logger estructurado.

---

## 8. Métricas de referencia

| Métrica | Valor |
| :--- | :--- |
| Archivos TypeScript backend | 51 |
| Archivos TypeScript frontend | 51 (componentes + servicios) |
| Controladores / servicios backend | 10 / 12 |
| Rutas API expuestas | 9 grupos, ~35 endpoints |
| Cobertura de pruebas | **0 %** |
| Documentos en `docs/` | 95 (incluye este informe) |
| Hallazgos por severidad | 3 críticos · 5 altos · 13 medios · 9 bajos |

---

*Informe generado a partir de lectura directa del código, compilación TypeScript de ambos paquetes y verificación de esquema/migraciones. Sin cambios de código aplicados.*
