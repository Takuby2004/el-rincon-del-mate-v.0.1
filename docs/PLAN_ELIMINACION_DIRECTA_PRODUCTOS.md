# Plan de Implementación: Eliminación Directa de Productos en el Panel Administrativo

## 1. Contexto y Diagnóstico
Actualmente, el botón con icono de basurero en la sección de **Gestión de Productos** realiza una **desactivación lógica** (`active: false`) en lugar de una eliminación permanente (como ocurre en la sección de **Gestión de Categorías**).

### Comportamiento actual:
1. **Frontend**: El modal de confirmación dice "¿Desactivar Producto?" con el icono de archivar (`fa-box-archive`).
2. **Backend**: El endpoint `DELETE /api/products/:id` ejecuta `prisma.product.update({ where: { id }, data: { active: false } })`.

### Comportamiento solicitado (Igual a Categorías):
1. **Frontend**:
   - Cambiar el título del botón tooltip a *"Eliminar Producto"*.
   - Mostrar modal de confirmación con título *"¿Eliminar Producto?"*, mensaje de advertencia *"¿Estás seguro de que deseas eliminar permanentemente [Nombre]? Esta acción no se puede deshacer."*, confirmText *"Sí, eliminar"*, e icono de papelera (`fa-trash-can`).
   - Manejo de respuesta con notificación de error amigable en caso de que el backend rechace la eliminación (por ejemplo, si tiene órdenes vinculadas).
2. **Backend**:
   - Validar si el producto está vinculado a pedidos (`OrderItem`). Si ya tiene historial de ventas, impedir la eliminación directa para preservar la integridad financiera e histórica de los pedidos y alertar al usuario.
   - Si no tiene ventas asociadas, eliminar en una transacción sus registros secundarios (como `InventoryMovement`) y luego eliminar físicamente el registro de `Product` (`prisma.product.delete`).

---

## 2. Archivos Involucrados

| Componente | Archivo | Acción |
| :--- | :--- | :--- |
| **Frontend UI** | [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html) | Actualizar el atributo `title` del botón de acción a "Eliminar Producto". |
| **Frontend Lógica** | [admin-products.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.ts) | Actualizar el texto del modal `DialogService`, icono a `fa-trash-can` y manejo de error con alerta visual. |
| **Backend Servicio** | [product.service.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/product.service.ts) | Cambiar de soft delete a `prisma.product.delete` con control de integridad referencial (`OrderItem` e `InventoryMovement`). |
| **Backend Controlador** | [product.controller.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/controllers/product.controller.ts) | Actualizar el mensaje de respuesta de éxito. |
| **Documentación** | [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) | Registrar el cambio en la documentación general. |

---

## 3. Glosario para Desarrolladores Juniors

- **Eliminación Lógica (Soft Delete)**: Técnica donde no se borra la fila de la base de datos, sino que solo se marca una bandera o booleano como inactivo (`active = false`). El registro sigue existiendo internamente.
- **Eliminación Física (Hard Delete)**: Acción de suprimir y borrar definitivamente la fila del registro en la base de datos (`DELETE FROM product WHERE id = ...`). No se puede recuperar una vez borrado.
- **Integridad Referencial (Foreign Keys)**: Regla en bases de datos relacionales que asegura que si una tabla (como `OrderItem` / Pedidos) depende de un ID de otra (`Product`), no se borre el producto dejando datos huérfanos o corrompidos.
- **Transacción de Base de Datos (`$transaction`)**: Bloque de operaciones que se ejecutan como un solo paquete; si alguna falla, todo vuelve a su estado original evitando inconsistencias.
