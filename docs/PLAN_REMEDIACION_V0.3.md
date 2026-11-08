# Plan de remediación v0.3 — cambios exactos

**Para:** agente implementador (Antigravity / Gemini)
**Base:** `HEAD` = `202fc459`
**Referencia:** `docs/AUDITORIA_TECNICA_V0.3.md`

Instrucciones generales antes de empezar:

- Todo el código y los mensajes van **en español**, con el estilo del repositorio (clases estáticas, `AppError`, comentarios en español).
- **No** refactorices nada que no esté listado aquí. No cambies el esquema de diseño ni los textos de la interfaz salvo donde se indica.
- Después de cada bloque, ejecuta los dos typechecks (§6). Si un cambio rompe el tipado, arréglalo en el mismo bloque.
- Cada tarea indica su **criterio de aceptación**: si no se cumple, la tarea no está terminada.

---

## FASE 1 — Bloqueantes de negocio

### T1 · C-02 · Fuga de `cost` en el endpoint público de categorías

**Archivo:** `backend/src/services/category.service.ts:12-22`

**Actual**
```ts
public static async getBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!category) throw AppError.notFound('Categoría no encontrada');
  return category;
}
```
El `include` trae **todas** las columnas de `Product`, incluido `cost` (costo de compra) y `stock` exacto.

**Cambio:** sustituir `include` por `select` con lista blanca.

```ts
public static async getBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      products: {
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          images: true,
          active: true,
          categoryId: true,
          createdAt: true
        }
      }
    }
  });
  if (!category) throw AppError.notFound('Categoría no encontrada');
  return category;
}
```

Extrae ese `select` de producto a un archivo nuevo `backend/src/utils/productSelect.ts` (`export const PUBLIC_PRODUCT_SELECT = {...} as const`) y reutilízalo también en `product.service.ts` para la rama pública de `getAll`/`getBySlug` (donde ya exista un `select` público, apúntalo a esta constante).

**Aceptación**
- `curl http://localhost:4000/api/categories/<slug>` no devuelve `cost` ni `unitCost` en ningún producto.
- El panel de administración sigue viendo el costo: usa `/api/products?...` con sesión admin (ruta ya separada).
- `tsc` en verde.

---

### T2 · C-03 + N-05 · Los pedidos cancelados siguen contando como ingreso

**Archivos:** `backend/src/services/stats.service.ts:13`, `backend/src/services/report.service.ts:67,95,152,239`, `backend/src/services/order.service.ts:485`

**Actual (idéntico en las 5 ubicaciones)**
```ts
where: {
  payment: { status: 'APPROVED' }
}
```
`.env` y la lógica de pago no cambian; el problema es que un pedido `CANCELLED` conserva `payment.status = 'APPROVED'`.

**Cambio 1 — constante compartida.** Nuevo archivo `backend/src/utils/revenue.ts`:
```ts
import { OrderStatus } from '@prisma/client';

/** Estados en los que el dinero se considera efectivamente cobrado. */
export const REVENUE_ORDER_STATUSES: OrderStatus[] = ['PAID', 'PACKING', 'SHIPPED', 'DELIVERED'];

/** Filtro reutilizable para reportes y métricas. */
export const REVENUE_ORDER_FILTER = {
  payment: { status: 'APPROVED' as const },
  status: { in: REVENUE_ORDER_STATUSES }
};
```

**Cambio 2 — aplicar el filtro.** En las 5 ubicaciones:
```ts
where: {
  ...REVENUE_ORDER_FILTER,
  ...(filter ? { createdAt: filter } : {})
}
```
En `stats.service.ts` además, los contadores `approvedCount` y `rejectedCount` deben contar **pedidos**, no pagos:
```ts
const approvedCount = await prisma.order.count({ where: REVENUE_ORDER_FILTER });
const rejectedCount = await prisma.order.count({
  where: { status: { in: ['PAYMENT_REJECTED', 'CANCELLED'] } }
});
```

**Cambio 3 — N-05: degradar el pago al cancelar.** En `order.service.ts`, dentro del `$transaction` de `updateOrderStatus`, añadir la rama que falta justo después de la de `PAYMENT_REJECTED` (línea ~485):
```ts
} else if (newStatus === 'CANCELLED') {
  paymentStatus = 'REJECTED';
  if (order.payment) {
    await tx.payment.update({
      where: { id: order.payment.id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: userId || null,
        rejectionReason: rejectionReason || 'Pedido cancelado por el administrador'
      }
    });
  }
}
```
> Nota de diseño: sin migración de esquema no existe `REFUNDED`. Se reutiliza `REJECTED` para que el pedido salga de los reportes. Deja un comentario `// TODO: introducir PaymentStatus.REFUNDED para distinguir devolución de rechazo`.

**Aceptación**
- Cancelar un pedido `PAID` deja `paymentStatus = 'REJECTED'` y `payment.status = 'REJECTED'`.
- Tras cancelarlo, `GET /api/admin/statistics` reduce `totalRevenue` en el importe del pedido.
- Los 4 PDF de reportes dejan de incluir pedidos cancelados.
- `grep -rn "payment: { status: 'APPROVED' }" backend/src` no devuelve resultados en servicios de reporte.

---

### T3 · A-01 · No se pueden desactivar productos

**Archivo:** `backend/src/validators/product.validator.ts:29`

**Actual**
```ts
active: z.coerce.boolean().optional().default(true)
```
`Boolean("false") === true`, así que el `FormData` del panel (`payload.append('active', this.formData.active.toString())`, `admin-products.component.ts:475`) **nunca** desactiva nada.

**Cambio**
```ts
active: z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true')
  .optional()
  .default(true)
```

`validateBody` hace `req.body = schema.parse(req.body)`, de modo que `ProductController.update` recibe un booleano real y su comprobación `req.body.active === 'true' || req.body.active === true` sigue funcionando para `true` y ahora también resuelve `false` correctamente. Verifica que `updateProductSchema.parse({}).active === undefined` (el `partial()` no debe inyectar el default).

**Aceptación**
- `PUT /api/products/:id` con `active=false` en `multipart/form-data` persiste `active: false` (comprobable en la base o en la respuesta).
- La ficha desaparece del catálogo público y del selector de categorías.
- `active=true` sigue activando.

---

### T4 · N-01 · Elevación a ADMIN por un correo con default hardcodeado

**Archivos:** `backend/src/config/env.ts:24-27`, `backend/src/services/auth.service.ts:89`, `backend/src/middlewares/auth.middleware.ts:28,78`, `backend/src/scripts/syncAdminUser.ts:13`

**Actual**
```ts
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').trim().toLowerCase();
```
```ts
} else if (isEmailAdmin && user.role !== 'ADMIN') {
  user = await prisma.user.update({ /* ... role: 'ADMIN' */ });
```
Tres defaults distintos entre archivos (`admin@elrincondelmate.com`, `admin@elrincondelmate.com`, `rincondelmatebo@gmail.com`). Si la variable falta, `admin@elrincondelmate.com` se convierte en llave del panel para quien logre registrar ese buzón.

**Cambio 1 — `env.ts`.** Añadir `ADMIN_EMAIL` a la configuración validada:
```ts
ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
```
y la comprobación junto a la de `JWT_SECRET`:
```ts
if (env.NODE_ENV === 'production' && !env.ADMIN_EMAIL) {
  console.error('❌ [CONFIG FATAL] ADMIN_EMAIL es obligatorio en producción. Configure el correo del administrador.');
  process.exit(1);
}
```

**Cambio 2 — `auth.middleware.ts` (ambas funciones, líneas 28 y 78).**
```ts
const adminEmail = env.ADMIN_EMAIL;
const isEmailAdmin = !!email && !!adminEmail && email === adminEmail;
```
Sin default. `env` ya está importado en ese archivo.

**Cambio 3 — `auth.service.ts`.** Usar `env.ADMIN_EMAIL` y **eliminar la auto-elevación** del login: el rol se decide solo en la base de datos, y la única vía de ascenso es `npm run auth:sync-admin`. Al crear el usuario que falta, `role: 'CLIENT'` siempre:
```ts
const adminEmail = env.ADMIN_EMAIL;
const isEmailAdmin = !!adminEmail && normalizedEmail === adminEmail;
...
if (!user) {
  user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: 'SUPABASE_AUTH_MANAGED',
      name: authData.user.user_metadata?.name || 'Cliente',
      role: 'CLIENT'
    },
    include: { clientProfile: true }
  });
}
```
Borra por completo el bloque `else if (isEmailAdmin && user.role !== 'ADMIN') { ... }`.

**Cambio 4 — `syncAdminUser.ts:13`.**
```ts
const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
if (!adminEmail) {
  console.error('❌ Define ADMIN_EMAIL en .env antes de ejecutar la sincronización.');
  process.exit(1);
}
```
Elimina también el teléfono hardcodeado del script si lo hay; el perfil debe salir de la base.

**Aceptación**
- Con `ADMIN_EMAIL` vacío y `NODE_ENV=production`, el proceso no arranca y explica por qué.
- Un usuario que inicia sesión con el correo del administrador pero tiene `role: 'CLIENT'` en la base **no** obtiene permisos de admin.
- `npm run auth:sync-admin` con `ADMIN_EMAIL=rincondelmatebo@gmail.com` eleva esa cuenta y el panel la reconoce como ADMIN.

---

### T5 · C-01 + N-03 + N-09 · Contraseña fija, `listUsers()` de una sola página y cambio de correo sin verificar

**Archivo:** `backend/src/services/profile.service.ts` (todo `updateProfile`)

Tres defectos en la misma función:

1. `listUsers()` sin paginar devuelve 50 usuarios; a partir del 51 el `find` falla.
2. En esa rama se **crea** un usuario nuevo con `'TempPassword_2026!'`.
3. No se pide la contraseña actual y se cambia el correo con `email_confirm: true`.

**Cambio A — buscar sin límite de página y sin crear nunca.**
```ts
private static async findSupabaseUserByEmail(email: string) {
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw AppError.internal(`No se pudo consultar Supabase Auth: ${error.message}`);
    }
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
  }
  return null;
}
```
```ts
const supabaseUser = await this.findSupabaseUserByEmail(existingUser.email);
if (!supabaseUser) {
  throw AppError.conflict(
    'La cuenta no está sincronizada con Supabase Auth. Contacta al administrador para regularizarla.'
  );
}
```
**Borra sin excepción** el bloque `else { const targetPassword = data.password || 'TempPassword_2026!'; ... createUser(...) }` y la constante `TempPassword_2026!` de todo el archivo.

**Cambio B — exigir contraseña actual.** Añadir `currentPassword?: string` a `UpdateProfileInput` y, antes de tocar nada:
```ts
const wantsCredentialChange = Boolean(data.email?.trim()) || Boolean(data.password?.trim());
if (wantsCredentialChange) {
  if (!data.currentPassword) {
    throw AppError.badRequest('Debes ingresar tu contraseña actual para cambiar el correo o la contraseña.');
  }
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: existingUser.email,
    password: data.currentPassword
  });
  if (verifyError) {
    throw AppError.unauthorized('La contraseña actual no es correcta.');
  }
}
```
Requiere importar `supabase` además de `supabaseAdmin` desde `../config/supabase`.

**Cambio C — no auto-confirmar el correo.** Eliminar `supabaseUpdates.email_confirm = true;`. Al cambiar el correo, Supabase enviará el enlace de confirmación al nuevo buzón; el `User.email` de Prisma se actualiza igual, pero el usuario no podrá iniciar sesión con la nueva dirección hasta confirmarla (comportamiento correcto).

**Cambio D — sin estados a medias.** Envolver las dos escrituras de Prisma del final en un `$transaction`:
```ts
const updatedUser = await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({ where: { id: userId }, data: updateData, select: { ... } });
  if (user.clientProfile) {
    await tx.client.update({ where: { id: user.clientProfile.id }, data: { ... } });
  }
  return user;
});
```
Y si esa transacción lanza después de que Supabase ya cambió, compensar antes de propagar:
```ts
} catch (prismaError) {
  try {
    await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
      email: existingUser.email,
      ...(data.password ? { password: data.currentPassword! } : {})
    });
  } catch (rollbackError) {
    console.error('[ProfileService] No se pudo revertir Supabase Auth:', rollbackError);
  }
  throw prismaError;
}
```

**Aceptación**
- Cambiar el correo sin `currentPassword` responde 400 con el mensaje en español.
- Con `currentPassword` incorrecta responde 401.
- Con 60+ usuarios en Supabase Auth, editar el perfil del usuario nº 60 **no** crea un duplicado (verificable en Authentication → Users).
- `grep -rn "TempPassword_2026!" backend/src` → sin resultados.

---

## FASE 2 — Riesgo operativo

### T6 · N-02 · Inyección de HTML en los correos

**Archivo:** `backend/src/services/email.service.ts`

**Actual:** líneas 393-399 definen `clientName`, `clientPhone`, `clientAddress`, `clientCity`, `clientNotes` y se interpolan sin escapar en 459, 477, 481, 487, 493, 501 y en `itemsHtml` (nombre de producto). También `customNote` (147) y `payment?.rejectionReason`.

**Cambio 1 — utilidad nueva** `backend/src/utils/html.ts`:
```ts
/** Escapa texto de usuario antes de insertarlo en una plantilla HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Cambio 2 — escapar en el origen**, justo donde se declaran las variables (así ninguna interpolación posterior queda sin cubrir):
```ts
const clientName = escapeHtml(client.name || 'Cliente');
const clientPhone = escapeHtml(order.phone || client.phone || 'No especificado');
const clientAddress = escapeHtml(order.address || client.address || 'Recojo en sucursal');
const clientCity = escapeHtml(order.city || client.city || 'Santa Cruz');
const clientNotes = escapeHtml(order.notes || 'Sin notas especiales.');
```
En `generatePaymentStatusHtml`: `const clientName = escapeHtml(order.client?.name || 'Estimado(a) Cliente');`, y en `itemsHtml` escapar `item.product?.name`.
En las notas y motivos: escapar `customNote` y `payment?.rejectionReason` **solo en la rama HTML**; en `generatePaymentStatusPlainText` déjalos sin escapar (el texto plano no interpreta HTML) pero recorta saltos de línea.

No escapes: `adminOrdersUrl`, `totalBs`, `orderNumber`, precios ni `cleanPhone` (ya es solo dígitos).

**Aceptación**
- Un pedido con `notes: <a href="https://x.test">clic</a>` produce un correo donde el texto aparece literal y **no** hay ningún `<a>` con ese `href`.
- Un nombre con `&` o comillas se ve correctamente (sin `&amp;amp;` doble: escapa una sola vez).
- Envío normal con datos limpios se ve idéntico al actual.

---

### T7 · N-04 · El ciclo de vida del pedido es inalcanzable desde el panel

**Archivos:** `frontend/src/app/features/admin-orders/admin-orders.component.ts` (`normalizeStatus`, `loadOrders`, `updateOrderStatus`), `frontend/src/app/features/admin-orders/admin-orders.component.html` (selector de estado), `backend/src/services/order.service.ts` (`ALLOWED_STATUS_TRANSITIONS`, `formatOrder`)

**Actual**
```ts
normalizeStatus(status: string): any {
  if (['PAID', 'APPROVED', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) return 'PAID';
  ...
}
```
```html
<option value="PENDING_PAYMENT_VERIFICATION">Pendiente de verificación</option>
<option value="PAID">Aprobado</option>
<option value="PAYMENT_REJECTED">Rechazado</option>
```
El backend permite `PAID → PACKING → SHIPPED → DELIVERED`, pero el panel colapsa todo en "Aprobado" y nunca puede enviar `PACKING`, `SHIPPED`, `DELIVERED` ni `CANCELLED`.

**Cambio 1 — backend expone las transiciones válidas.** En `order.service.ts`, exportar la constante:
```ts
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = { /* sin cambios */ };
```
y añadirla al DTO en `formatOrder`:
```ts
allowedTransitions: ALLOWED_STATUS_TRANSITIONS[(order.status as OrderStatus)] || []
```

**Cambio 2 — frontend conserva el estado real.** En `loadOrders`, no sobrescribas `status`; añade el campo normalizado aparte:
```ts
this.orders = list.map((o: any) => ({
  ...o,
  statusRaw: o.status,
  total: Number(o.total) || 0,
  subtotal: Number(o.subtotal) || 0,
  payment: o.payment ? { ...o.payment, amount: Number(o.payment.amount) || 0 } : o.payment,
  items: (o.items || []).map((it: any) => ({ ...it, unitPrice: Number(it.unitPrice) || 0, unitCost: Number(it.unitCost) || 0, subtotal: Number(it.subtotal) || 0 }))
}));
```
Elimina `normalizeStatus()` y sus llamadas (también en `openOrderModal`).

**Cambio 3 — selector completo y transiciones deshabilitadas.** En el componente:
```ts
readonly statusOptions = [
  { value: 'PENDING_PAYMENT_VERIFICATION', label: 'Pendiente de verificación' },
  { value: 'PAID', label: 'Pagado / Aprobado' },
  { value: 'PACKING', label: 'En preparación' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'PAYMENT_REJECTED', label: 'Pago rechazado' },
  { value: 'CANCELLED', label: 'Cancelado' }
];

selectedStatus = '';

isTransitionAllowed(status: string): boolean {
  const current = this.selectedOrder?.statusRaw;
  if (!current) return false;
  if (status === current) return true;
  return (this.selectedOrder?.allowedTransitions || []).includes(status);
}
```
En el HTML, reemplazar las tres opciones fijas por:
```html
<select [(ngModel)]="selectedStatus" class="...">
  @for (opt of statusOptions; track opt.value) {
    <option [value]="opt.value" [disabled]="!isTransitionAllowed(opt.value)">{{ opt.label }}</option>
  }
</select>
```
Inicializa `this.selectedStatus = order.statusRaw` al abrir el modal (`openOrderModal`) y `updateOrderStatus()` debe enviar `this.selectedStatus`. No uses `selectedOrder!.status` en un two-way binding: la expresión no es asignable.

**Cambio 4 — etiquetas honestas.** `getOrderStatusLabel` y `getOrderStatusBadgeClass` cubren los 7 estados (usa `statusRaw`): `PENDING_PAYMENT_VERIFICATION` ámbar, `PAID`/`PACKING`/`SHIPPED` verde, `DELIVERED` verde oscuro/azul, `PAYMENT_REJECTED`/`CANCELLED` rojo. Ajusta también los `<option>` del filtro `filterOrderStatus` para incluir los 7.

**Aceptación**
- Desde el panel se puede pasar un pedido `PAID → PACKING → SHIPPED → DELIVERED`.
- Al abrir un pedido entregado, el selector muestra "Entregado" (no "Aprobado") y `DELIVERED` no ofrece transiciones.
- Los filtros por estado listan los 7 valores y filtran correctamente.
- `tsc` en verde en ambos proyectos.

---

### T8 · N-06 · El cliente admin de Supabase degrada a anon en silencio

**Archivo:** `backend/src/config/supabase.ts:1-40`

**Actual**
```ts
const supabaseUrl = env.SUPABASE_URL || 'https://gleylrngndyvxaucxfrf.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_G6c3Jhy7DL4YBnCIsGWvzw_UMqOWpC7';
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
```

**Cambio**
```ts
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [CONFIG FATAL] SUPABASE_URL y SUPABASE_ANON_KEY son obligatorias. Revise el archivo .env.');
  process.exit(1);
}

const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey && env.NODE_ENV === 'production') {
  console.error('❌ [CONFIG FATAL] SUPABASE_SERVICE_ROLE_KEY es obligatoria en producción (Storage y administración de usuarios).');
  process.exit(1);
}
if (!supabaseServiceRoleKey) {
  console.warn('⚠️  [CONFIG] Sin SUPABASE_SERVICE_ROLE_KEY: supabaseAdmin operará con la clave anon y las operaciones administrativas fallarán. Solo válido en desarrollo local.');
}
```
`supabaseAdmin` se construye con `supabaseServiceRoleKey || supabaseAnonKey`, pero ahora el aviso es explícito y en producción no arranca. **Elimina** la URL y la publishable key del código.

**Aceptación**
- `grep -rn "gleylrngndyvxaucxfrf\|sb_publishable_" backend/src` → sin resultados.
- En producción sin `SUPABASE_SERVICE_ROLE_KEY` el arranque falla con mensaje claro.
- En desarrollo sin la clave, aparece el `warn` una sola vez al importar el módulo.

---

### T9 · N-07 · Correos perdidos en silencio si falta SMTP

**Archivo:** `backend/src/services/email.service.ts:22-60` (`getTransporter`)

**Cambio**
```ts
if (smtpUser && smtpPass) { /* igual que ahora */ }

if (env.NODE_ENV === 'production') {
  throw new AppError('SMTP no configurado. Defina SMTP_USER y SMTP_PASS para enviar correos.', 500);
}
// Fallback solo para desarrollo local
console.log('[EmailService] ℹ️ Sin credenciales SMTP. Usando buzón de prueba Ethereal (solo desarrollo).');
```
Y en `sendPaymentStatusNotification` / `sendNewOrderAdminNotification`, capturar el error de configuración y devolver un resultado explícito en lugar de lanzar dentro del flujo del pedido:
```ts
return { success: false, error: 'SMTP no configurado', previewText: null };
```
Los controladores (`payment.controller.ts`, `order.controller.ts`) ya usan `emailNotified`; asegúrate de que sea `false` en ese caso y de que el pedido **no** falle por ello.

**Aceptación**
- Con `NODE_ENV=production` y sin SMTP, el pedido se crea correctamente y la respuesta trae `emailNotified: false`.
- En desarrollo sin SMTP sigue saliendo el enlace de vista previa de Ethereal en el log.
- El panel muestra el aviso "no se pudo notificar" en lugar de "Correo enviado exitosamente".

---

### T10 · N-08 · La sesión caduca a la hora sin renovarse

**Archivos:** `backend/src/services/auth.service.ts` (login/register), `frontend/src/app/core/services/auth.service.ts`, `frontend/src/app/core/interceptors/jwt.interceptor.ts`, nueva ruta `POST /api/auth/refresh`

**Cambio 1 — devolver el refresco.** En `login` y `register`:
```ts
return {
  user: { ... },
  token: authData.session.access_token,
  refreshToken: authData.session.refresh_token,
  expiresAt: authData.session.expires_at
};
```

**Cambio 2 — endpoint de refresco** en `backend/src/services/auth.service.ts`:
```ts
public static async refresh(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) throw AppError.unauthorized('La sesión expiró. Vuelve a iniciar sesión.');
  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at
  };
}
```
Ruta pública con rate limit estricto (mismo `authLimiter` de `/auth`):
```ts
router.post('/refresh', authLimiter, AuthController.refresh);
```
Valida con Zod que `refreshToken` es un string no vacío.

**Cambio 3 — almacenar y usar.** `frontend/src/app/core/services/auth.service.ts`:
- Guarda `mate_refresh` y `mate_token_exp` en `sessionStorage` junto a `mate_token`.
- Añade `refresh(): Observable<any>` que llame a `/auth/refresh` y actualice los tres valores.

**Cambio 4 — interceptor.** En `jwt.interceptor.ts`, ante `401` o `403` con sesión activa: intenta **un** refresco, reintenta la petición original con el token nuevo; si el refresco falla, `logout()` y redirige a `/admin/login` con aviso.

**Aceptación**
- Se puede forzar la caducidad (`auth.admin.signOut` del usuario o esperar) y, al navegar, la petición se renueva sin que el usuario vuelva a escribir la contraseña.
- Con `refresh_token` inválido o revocado, se cierra sesión limpiamente y no hay bucle infinito de reintentos.

---

### T11 · N-11 · Remitente desalineado con la cuenta SMTP

**Archivo:** `backend/src/services/email.service.ts:282-320` (`getAdminSender`)

**Cambio:** usar siempre la cuenta autenticada como remitente.
```ts
const smtpUser = process.env.SMTP_USER?.trim();
const adminEmail = env.ADMIN_EMAIL || smtpUser || 'notificaciones@elrincondelmate.com';
const fromEmail = smtpUser || adminEmail;
const fromAddress = `"El Rincón del Mate" <${fromEmail}>`;
return { email: adminEmail, name: 'El Rincón del Mate', fromAddress };
```
Elimina el `prisma.user.findFirst({ where: { role: 'ADMIN' } })` (y su `try/catch` completo, que ya no hace falta) y pasa `adminEmail` como `replyTo` en los dos `sendMail`.

**Aceptación**
- El `from` del correo coincide con `SMTP_USER`.
- `replyTo` es el correo del administrador configurado.
- Gmail deja de reescribir el remitente; el correo llega a la bandeja de entrada y no a spam en una prueba real.

---

## FASE 3 — Deuda estructural

### T12 · A-03 · Comprobantes accesibles sin autenticación

**Archivos:** `backend/src/app.ts:47`, `backend/src/utils/fileStorageService.ts`, `backend/src/routes/payment.routes.ts`, `frontend/src/app/features/admin-orders/*`

**Cambio 1 — cerrar el estático en producción.** En `app.ts`:
```ts
if (env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}
```

**Cambio 2 — URL firmada.** Añadir a `FileStorageService`:
```ts
public static async getSignedUrl(fileUrl: string, expiresInSeconds = 300): Promise<string> {
  // Extrae el objectPath del bucket a partir de la URL pública y usa supabaseAdmin.storage.from(bucket).createSignedUrl(...)
  // En modo disco local (desarrollo) devuelve la URL tal cual.
}
```

**Cambio 3 — endpoint autenticado.**
```ts
router.get('/payments/:id/proof', authenticateToken, PaymentController.getProof);
```
El controlador verifica que el solicitante sea ADMIN o el dueño del pedido, y responde `{ url }` con caducidad de 5 minutos.

**Cambio 4 — DTO.** Que `formatOrder` deje de incluir `payment.paymentProof.imageUrl` en la respuesta pública (el pedido del comprador solo necesita saber que hay comprobante: `hasProof: boolean`).

**Cambio 5 — frontend.** El modal de comprobante pide la URL firmada al abrirse, en lugar de usar la ruta directa:
```ts
this.apiService.getPaymentProofUrl(order.payment!.id).subscribe(({ url }) => (this.zoomImageUrl = url));
```
El `<img>` de la miniatura en la tabla sigue usando la ruta pública **solo** en desarrollo; en producción usa el mismo endpoint (caché en memoria por pedido para no pedir 20 URLs por tabla).

**Aceptación**
- `GET /uploads/payments/<archivo>` responde 404 en producción.
- Sin token, `GET /api/payments/:id/proof` responde 401; con token de otro cliente, 403.
- El administrador sigue viendo y ampliando comprobantes.
- La URL firmada deja de funcionar pasados 5 minutos.

---

### T13 · A-05 · Migraciones desincronizadas con el schema

**Archivo:** `backend/prisma/migrations/20260907212748_init/migration.sql`

La migración inicial crea todos los importes como `DOUBLE PRECISION` y **no** incluye `Product.images`, mientras `schema.prisma` declara `Decimal(12,2)` y `images String[]`.

**Cambio:** generar una migración incremental que iguale el estado (no editar la migración ya aplicada en producción).
```bash
cd backend
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$SHADOW_DATABASE_URL" \
  --script > prisma/migrations/20261108_sync_schema/migration.sql
```
Debe contener, como mínimo:
```sql
ALTER TABLE "Product" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING "price"::numeric(12,2);
ALTER TABLE "Product" ALTER COLUMN "cost"  TYPE DECIMAL(12,2) USING "cost"::numeric(12,2);
ALTER TABLE "Order"   ALTER COLUMN "total" TYPE DECIMAL(12,2) USING "total"::numeric(12,2);
-- ... resto de columnas monetarias y de OrderItem
```
Revisa a mano el SQL generado antes de commitearlo. Después, el comando de despliegue debe ser `prisma migrate deploy` (nunca `db push`) en Render.

**Aceptación**
- `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script` devuelve **vacío**.
- Los precios con decimales (`10.50`) se conservan exactos tras migrar una copia de la base.

---

### T14 · M-02 · Fallback de JWT legacy que confía en el payload

**Archivo:** `backend/src/middlewares/auth.middleware.ts:47-55,96-105`

**Cambio:** eliminar los dos bloques
```ts
if (env.JWT_SECRET) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = decoded;
    return next();
  } catch { }
}
```
y la importación de `jsonwebtoken` si queda sin uso. Supabase Auth es la única fuente de identidad. El contrato de error no cambia: `403` con "Token inválido o expirado".

**Aceptación**
- Un token firmado con `JWT_SECRET` y sin usuario en Supabase **no** autentica.
- `grep -rn "jwt.verify" backend/src` → sin resultados.

---

### T15 · M-05 · El frontend envía `limit`, el backend lee `pageSize`

**Archivo:** `frontend/src/app/core/services/api.service.ts:22,96,129`

**Cambio:** enviar el parámetro con el nombre que el backend interpreta y tiparlo igual.
```ts
getProducts(filters?: { categoryId?: string; search?: string; activeOnly?: boolean; page?: number; pageSize?: number })
...
if (filters?.pageSize) params = params.set('pageSize', filters.pageSize.toString());
```
Igual en `getOrders` y `getClients`. Revisa los componentes que llaman con `limit` (`catalog`, `admin-products`, `admin-orders`, `admin-clients`) y renómbralos.

Además, en `admin-orders.component.ts` la paginación es solo de cliente (`pageSize = 5` sobre la lista completa). Pasa `page`/`pageSize` al backend y usa `res.total`/`res.totalPages` de `buildPaginatedResponse` en `<app-pagination>`.

**Aceptación**
- `GET /api/products?page=1&pageSize=12` devuelve exactamente 12 elementos y metadatos de paginación.
- El panel de pedidos hace una petición por página, no descarga todo el historial.
- `grep -rn "'limit'" frontend/src` → sin resultados en `api.service.ts`.

---

### T16 · N-10 · El sondeo consume la cuota del rate limit

**Archivos:** `frontend/src/app/features/admin-orders/admin-orders.component.ts:83`, `frontend/src/app/features/orders/order-detail.component.ts:70`

**Cambio**
```ts
this.pollingSub = interval(30000)
  .pipe(filter(() => !document.hidden))
  .subscribe(() => { /* ... */ });
```
En `order-detail.component.ts`, subir a 10000 ms y **detener el sondeo** al alcanzar un estado final:
```ts
if (this.order && ['APPROVED', 'REJECTED'].includes(this.order.paymentStatus)) {
  this.stopPolling();
}
```
Añade `filter(() => !document.hidden)`. En el panel, además, no recargues si hay un modal abierto (ya existe esa condición: consérvala).

**Aceptación**
- Con la pestaña en segundo plano no se emiten peticiones (comprobable en la pestaña Network).
- La pantalla del pedido deja de sondear al aprobarse o rechazarse el pago.
- Ninguna sesión normal supera 20 req/min por pestaña.

---

### T17 · M-12 · Falta `.env.example`

**Archivo nuevo:** `backend/.env.example`

Incluye todas las variables con valores de ejemplo **sin secretos reales**:
```ini
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://usuario:password@localhost:5432/elrincon?schema=public"

# Obligatorio, mínimo 32 caracteres
JWT_SECRET=cambia-esto-por-una-cadena-aleatoria-de-64-caracteres

# Correo del administrador (obligatorio en producción)
ADMIN_EMAIL=rincondelmatebo@gmail.com

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=el-rincon-del-mate

# SMTP (Gmail App Password). Obligatorio en producción.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=

# CORS
FRONTEND_URL=http://localhost:4200
```
Actualiza el README: `cp .env.example .env` ya será verdad, y añade la nota de que `ADMIN_EMAIL` y `SMTP_*` son obligatorias en producción.

**Aceptación**
- Un clon limpio arranca siguiendo solo el README.
- `git check-ignore backend/.env.example` no lo ignora y el archivo **no** contiene valores reales.

---

### T18 · A-04 · Primera suite de pruebas

**Archivo nuevo:** `backend/src/__tests__/` con Vitest + Supertest, y script `"test": "vitest run"` en `backend/package.json`.

Mínimo imprescindible, una prueba por riesgo ya identificado:

| Prueba | Qué fija |
| --- | --- |
| `pagination.test.ts` | `parsePaginationParams` acota `pageSize` a 100 y rechaza negativos |
| `transitions.test.ts` | `PAID → DELIVERED` se rechaza; `PAID → PACKING → SHIPPED → DELIVERED` se acepta; `DELIVERED` no admite salidas |
| `cancelOrder.test.ts` | Cancelar un pedido `PAID` restaura stock **y** deja el pago en `REJECTED` |
| `productValidator.test.ts` | `active: 'false'` → `false`; `'true'` → `true`; ausente → no se inyecta en `updateProductSchema` |
| `revenueFilter.test.ts` | Un pedido `CANCELLED` con pago `APPROVED` no aparece en `getDashboardStats` |
| `htmlEscape.test.ts` | `escapeHtml('<a href="x">')` no deja etiquetas utilizables |

**Aceptación**
- `npm test` en `backend` ejecuta las 6 y pasa.
- Romper a propósito cualquiera de las correcciones anteriores hace fallar al menos una prueba.

---

## 6. Verificación global

Al terminar cada fase, y obligatoriamente al final:

```bash
cd backend && npx tsc --noEmit -p tsconfig.json; echo "BACKEND_EXIT=$?"
cd ../frontend && npx tsc -p tsconfig.app.json --noEmit; echo "FRONTEND_EXIT=$?"
cd ../backend && npm test; echo "TEST_EXIT=$?"
```

Los tres deben terminar en `0`. Cualquier otra cosa significa que la fase no está cerrada.

Comprobaciones manuales que no cubre el tipado:

1. Registrar un cliente nuevo y entrar al panel con la cuenta admin.
2. Crear un pedido con comprobante, aprobarlo, pasarlo a `PACKING → SHIPPED → DELIVERED` desde el panel.
3. Cancelar un pedido ya pagado y confirmar que el ingreso del dashboard baja.
4. Editar el perfil cambiando el correo sin contraseña actual (debe fallar) y con ella (debe funcionar).
5. Enviar un pedido con `<b>test</b>` en las notas y revisar el correo recibido.

---

## 7. Fuera de alcance de este plan

- Rediseño de la interfaz o cambios de estilos.
- Migración a otro proveedor de correo, base de datos o almacenamiento.
- Introducción de `PaymentStatus.REFUNDED` (requiere migración; queda como TODO en T2).
- Limpieza de los 100 documentos de `docs/` (solo se actualiza el README en T17).
