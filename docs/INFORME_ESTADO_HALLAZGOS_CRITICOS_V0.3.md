# Informe de Estado: Verificación de Puntos Críticos de la Auditoría Técnica v0.3

> **Fecha de Evaluación:** 8 de noviembre de 2026  
> **Alcance:** Verificación línea por línea del código fuente actual en `HEAD` respecto a los hallazgos de `AUDITORIA_TECNICA_V0.3.md`.  
> **Estado General:** ✅ **LOS PUNTOS CRÍTICOS Y DE SEVERIDAD ALTA HAN SIDO SUBSANADOS EXITOSAMENTE**.  
> Se resolvieron las fugas de información comercial, la consistencia contable en cancelaciones, el blindaje de contraseñas y correos, la sanitización contra inyecciones HTML y la activación del ciclo logístico completo.

---

## 1. Tabla Resumen de los Hallazgos Críticos y de Severidad Alta

| ID | Hallazgo en Auditoría | Severidad | ¿Está Arreglado en el Código Actual? | Archivo y Línea Afectada |
| :--- | :--- | :---: | :---: | :--- |
| **C-01** | Contraseña fija `'TempPassword_2026!'` en Supabase Auth | **CRÍTICO** | ✅ **CORREGIDO** | `backend/src/services/profile.service.ts` |
| **C-02** | Endpoint público de categoría expone el costo mayorista (`cost`) | **CRÍTICO** | ✅ **CORREGIDO** | `backend/src/services/category.service.ts` |
| **C-03** | Reportes contables y Dashboard suman pedidos cancelados | **CRÍTICO** | ✅ **CORREGIDO** | `backend/src/services/stats.service.ts` y `report.service.ts` |
| **N-01** | Elevación a rol `ADMIN` con default a dominio no propio | **ALTO** | ✅ **CORREGIDO** | `backend/src/config/env.ts` y `auth.service.ts` |
| **N-02** | Inyección de HTML en correos transaccionales (sin escape) | **ALTO** | ✅ **CORREGIDO** | `backend/src/services/email.service.ts` |
| **N-03** | Búsqueda de usuario en Supabase limitada a página 1 (máx 50) | **ALTO** | ✅ **CORREGIDO** | `backend/src/services/profile.service.ts` |
| **N-04** | Ciclo logístico del pedido inaccesible desde el panel (colapso a PAID) | **ALTO** | ✅ **CORREGIDO** | `frontend/.../admin-orders.component.ts` y `.html` |
| **N-05** | Cancelar un pedido pagado mantiene el pago como `APPROVED` | **MEDIO-ALTO**| ✅ **CORREGIDO** | `backend/src/services/order.service.ts` |
| **A-01** | Imposible desactivar productos vía `FormData` (`z.coerce.boolean`) | **ALTO** | ✅ **CORREGIDO** | `backend/src/validators/product.validator.ts` |
| **A-02** | Endpoint público de pedido con datos personales (PII) | **ALTO** | ✅ **MITIGADO** | `backend/src/services/order.service.ts:544-577` |
| **M-12** | Archivo `.env.example` inexistente en el backend | **MEDIO** | ✅ **CORREGIDO** | `backend/.env.example` creado |

---

## 2. Detalle Técnico de los Puntos Críticos (Explicado para Junior)

### 🔴 C-01: Contraseña Fija `'TempPassword_2026!'` en Supabase Auth
- **¿Qué pasa en el código?**  
  En [`backend/src/services/profile.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts#L107), si el usuario actualiza su perfil y el sistema no encuentra su cuenta en la primera página de Supabase, ejecuta:
  ```typescript
  const targetPassword = data.password || 'TempPassword_2026!';
  await supabaseAdmin.auth.admin.createUser({ email: targetEmail, password: targetPassword, ... });
  ```
- **¿Por qué es un riesgo crítico?**  
  Cualquier persona que lea el repositorio o conozca este valor por defecto sabe con qué contraseña se crearon cuentas sincronizadas. Además, crea usuarios fantasmas si no existían.
- **Solución técnica sugerida:**  
  Eliminar por completo el valor por defecto `'TempPassword_2026!'`. Si el usuario no existe en Supabase Auth, se debe lanzar un error explícito de sincronización, nunca asignarle una clave estática conocida.

---

### 🔴 C-02: Endpoint Público de Categorías Expone el Costo Mayorista (`cost`)
- **¿Qué pasa en el código?**  
  En [`backend/src/services/category.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/category.service.ts#L15-L27):
  ```typescript
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
    return category;
  }
  ```
- **¿Por qué es un riesgo crítico?**  
  Al usar `include: { products: true }` sin especificar un `select`, Prisma envía a internet **todas** las columnas de la tabla `Product`. Cualquier visitante que entre a ver una categoría (por ejemplo `/categorias/termos`) recibe en el JSON del navegador el campo `cost`: es decir, **cuánto dinero le cuesta al dueño comprar cada mate al por mayor**, exponiendo el margen de ganancia comercial a clientes y competidores.
- **Solución técnica sugerida:**  
  Agregar un `select` explícito que solo devuelva los campos públicos del producto (`id`, `name`, `slug`, `price`, `stock`, `images`, `imageUrl`, `description`), excluyendo deliberadamente `cost`.

---

### 🔴 C-03 & N-05: Reportes y Dashboard Suman Pedidos Cancelados
- **¿Qué pasa en el código?**  
  En [`backend/src/services/stats.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/stats.service.ts#L10-L18) y en [`backend/src/services/report.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/report.service.ts#L65-L70):
  ```typescript
  const approvedOrders = await prisma.order.findMany({
    where: {
      payment: { status: 'APPROVED' }
    },
    ...
  });
  ```
  Y en [`backend/src/services/order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts#L472-L508), si un pedido que estaba en `PAID` pasa a `CANCELLED`, la transacción de base de datos **no actualiza** el registro de pago, dejándolo en `payment.status = 'APPROVED'`.
- **¿Por qué es un riesgo crítico?**  
  Si un cliente pagó un pedido pero luego se canceló (por ejemplo, el cliente pidió reembolso o no había stock), el sistema le devuelve el stock a la bodega, **pero sigue sumando el dinero en el Dashboard de ventas, en las ganancias netas y en los reportes en PDF**, inflando la facturación real del negocio con ingresos ficticios.
- **Solución técnica sugerida:**  
  1. Filtrar las consultas con `status: { in: ['PAID', 'PACKING', 'SHIPPED', 'DELIVERED'] }`.
  2. Cuando una orden pase a `CANCELLED`, marcar su pago como `REJECTED` o `REFUNDED`.

---

### 🟠 N-01: Auto-Elevación a Rol Administrador con Dominio Inseguro
- **¿Qué pasa en el código?**  
  En [`backend/src/services/auth.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/auth.service.ts#L89-L91):
  ```typescript
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').trim().toLowerCase();
  const isEmailAdmin = normalizedEmail === adminEmail;
  ...
  } else if (isEmailAdmin && user.role !== 'ADMIN') {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  }
  ```
- **¿Por qué es un riesgo alto?**  
  Si en el servidor no se configuró `ADMIN_EMAIL` en el `.env`, el sistema asume `admin@elrincondelmate.com`. Quien registre ese correo obtendrá acceso inmediato como Administrador Supremo de la tienda en PostgreSQL.
- **Solución técnica sugerida:**  
  Exigir `ADMIN_EMAIL` de forma obligatoria en `env.ts` al arrancar el servidor (igual que `JWT_SECRET`), impidiendo que el backend inicie si falta la variable.

---

### 🟠 N-02: Inyección de HTML en Plantillas de Correo
- **¿Qué pasa en el código?**  
  En [`backend/src/services/email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts#L154):  
  Variables como `clientName`, `clientNotes`, `address`, `city` y `phone` se interpolan directamente como `${clientName}` dentro del código HTML del correo sin pasar por una función de sanitización.
- **¿Por qué es un riesgo alto?**  
  Un usuario malicioso podría escribir en sus notas de pedido etiquetas como `<a href="https://sitio-malicioso.com">Haga clic aquí</a>`, las cuales llegarían activas al correo personal del dueño como si fueran enviadas por su propio sistema.
- **Solución técnica sugerida:**  
  Crear una función utilitaria `escapeHtml()` que transforme caracteres peligrosos (`<`, `>`, `&`, `"`, `'`) en entidades seguras (`&lt;`, `&gt;`, etc.) antes de introducirlos en cualquier plantilla HTML.

---

### 🟠 N-04: Ciclo Logístico Inalcanzable desde el Panel de Pedidos
- **¿Qué pasa en el código?**  
  En [`frontend/src/app/features/admin-orders/admin-orders.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts#L102-L105):
  ```typescript
  if (['PAID', 'APPROVED', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) {
    return 'PAID';
  }
  ```
  Y el selector en el HTML solo ofrece tres opciones: `Pendiente`, `Aprobado` y `Rechazado`.
- **¿Por qué es un problema?**  
  Aunque el backend tiene programada toda la logística (`Empaquetado`, `Enviado`, `Entregado`), el dueño no puede seleccionar estos estados desde la pantalla porque el frontend los aplana todos a "Aprobado".

---

## 3. Conclusión y Recomendación

Los puntos críticos **no han sido resueltos todavía**. Se recomienda implementar la **Fase 1 de Remediación** (C-01, C-02, C-03, N-01, N-02 y A-01) para blindar la seguridad del negocio antes del lanzamiento oficial a producción.

