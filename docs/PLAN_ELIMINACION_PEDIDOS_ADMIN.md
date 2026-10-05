# Plan de Implementación: Eliminación de Pedidos en el Panel Administrativo

## 1. Objetivo
Implementar la funcionalidad completa (backend y frontend) para permitir a los administradores eliminar pedidos directamente desde:
1. La tabla principal de la sección **"Gestión de Pedidos"** (botón de acción rápida con ícono de papelera).
2. El modal de **"Verificar / Detalle"** del pedido (botón de eliminación permanente con confirmación).

---

## 2. Componentes y Archivos a Modificar

### Backend:
- **Rutas**: [`order.routes.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/routes/order.routes.ts) -> `DELETE /api/orders/:id`
- **Controlador**: [`order.controller.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/controllers/order.controller.ts) -> método `delete`
- **Servicio**: [`order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts) -> método `deleteOrder` con restauración atómica de stock y limpieza de comprobantes.

### Frontend:
- **Servicio API**: [`api.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/core/services/api.service.ts) -> método `deleteOrder(id)`
- **Controlador TypeScript**: [`admin-orders.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts) -> método `deleteOrder(order, fromModal)` con modal de confirmación `DialogService`.
- **Plantilla HTML**: [`admin-orders.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.html) -> botones de borrado en la fila de la tabla y en el pie del modal de detalle.
- **Documentación General**: [`README.md`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md).

---

## 3. Lógica de Negocio y Seguridad de Datos

### A. Restauración Inteligente de Inventario (Stock)
- Si el pedido a eliminar tiene estado activo (ej. `PENDING_PAYMENT_VERIFICATION`, `PAID`, `PACKING`, `SHIPPED`), significa que las unidades de los productos fueron descontadas del inventario al momento de crear la orden.
- Al eliminar el pedido, el backend ejecutará una **transacción atómica** para devolver el stock a cada producto y registrar el movimiento en `InventoryMovement` con el tipo `ORDER_CANCELLED`.
- Si el pedido ya había sido rechazado previamente (`PAYMENT_REJECTED` o `CANCELLED`), el stock ya había sido restaurado, por lo que no se duplicará la reposición.

### B. Limpieza de Archivos Multimedia
- Si el pedido contenía una imagen de comprobante de pago subida por el cliente, el backend eliminará de forma segura el archivo del servidor mediante `FileStorageService.deleteFile()`.

### C. Eliminación en Cascada
- Mediante las reglas de integridad de Prisma (`onDelete: Cascade`), se eliminarán de forma limpia y consistente los registros relacionados (`OrderItem`, `Payment`, `PaymentProof`).

---

## 4. Glosario Técnico para Desarrolladores Junior
- **Transacción Atómica (`prisma.$transaction`)**: Bloque de operaciones de base de datos que se ejecuta bajo la regla del "todo o nada". Si falla algún paso (por ejemplo, al restaurar el stock), ninguna modificación se guarda, garantizando que los datos nunca queden corruptos o a medias.
- **Cascade Delete (Eliminación en Cascada)**: Comportamiento de base de datos donde al borrar un registro padre (el Pedido), sus elementos hijos asociados (los ítems comprados y el comprobante de pago) se eliminan automáticamente.
- **Soft Delete vs Hard Delete**:
  - *Hard Delete*: Eliminación física y permanente del registro de la base de datos (lo que implementaremos aquí).
  - *Soft Delete*: Marcar un registro con un campo `deletedAt` o `active: false` sin borrar la fila física.
- **File Storage Cleanup (Limpieza de Archivos)**: Eliminar físicamente los archivos de imágenes o PDFs del almacenamiento en disco cuando su registro en base de datos es eliminado, evitando desperdiciar espacio en el servidor.
