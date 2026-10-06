# Plan de Implementación: Reducción y Simplificación de Estados de Pedido

## 1. Resumen del Requerimiento
Actualmente, el sistema contaba con múltiples estados de pedido distribuidos entre la logística física y el pago (`PENDING_PAYMENT_VERIFICATION`, `PAID`, `PACKING`, `SHIPPED`, `DELIVERED`, `PAYMENT_REJECTED`, `CANCELLED`).

El objetivo es **simplificar y unificar la sección "Pedidos" del Panel Administrativo** para que opere de forma directa y clara con únicamente **3 estados principales**:
1. ⏳ **Pendiente de verificación**: El cliente ha realizado el pedido y subido su comprobante QR; está a la espera de que el administrador lo revise.
2. ✅ **Aprobado**: El administrador ha aprobado el pago/pedido exitosamente.
3. ❌ **Rechazado**: El comprobante o pedido ha sido rechazado (restaurando el stock de los productos).

---

## 2. Puntos Clave de la Modificación

### A. Frontend: Componente de Gestión de Pedidos (`admin-orders.component.html` y `.ts`)
1. **Filtro de Estados de Pedido**:
   - Reducir el selector a:
     - *Todos los Estados*
     - ⏳ *Pendiente de verificación* (`PENDING_PAYMENT_VERIFICATION`)
     - ✅ *Aprobado* (`PAID`)
     - ❌ *Rechazado* (`PAYMENT_REJECTED`)
2. **Selector de Cambio de Estado en el Modal de Detalle**:
   - Simplificar el `<select>` de actualización rápida para ofrecer únicamente las 3 opciones:
     - `PENDING_PAYMENT_VERIFICATION` -> *Pendiente de verificación*
     - `PAID` -> *Aprobado*
     - `PAYMENT_REJECTED` -> *Rechazado*
3. **Mapeo Visual de Etiquetas e Insignias (Badges)**:
   - Modificar la función `getOrderStatusLabel()` para retornar:
     - `PENDING_PAYMENT_VERIFICATION`: 'Pendiente de verificación'
     - `PAID`, `APPROVED`, `PACKING`, `SHIPPED`, `DELIVERED`: 'Aprobado'
     - `PAYMENT_REJECTED`, `REJECTED`, `CANCELLED`: 'Rechazado'
   - Actualizar los colores de los badges en la tabla:
     - **Pendiente**: Fondo ámbar suave con texto ámbar oscuro (`bg-amber-100 text-amber-800`).
     - **Aprobado**: Fondo esmeralda/verde con texto verde oscuro (`bg-emerald-100 text-emerald-800`).
     - **Rechazado**: Fondo rojo suave con texto rojo oscuro (`bg-red-100 text-red-800`).
4. **Tarjetas de Métricas Rápidas**:
   - Ajustar el título de la tarjeta a **"Aprobados"** e **"Ingresos Aprobados"** para máxima coherencia en la interfaz.

### B. Backend: Servicio de Pedidos (`backend/src/services/order.service.ts`)
1. **Validación y Sincronización en `updateOrderStatus`**:
   - Permitir transición fluida entre `PENDING_PAYMENT_VERIFICATION`, `PAID` (Aprobado) y `PAYMENT_REJECTED` (Rechazado).
   - Sincronizar automáticamente el estado del pago y restaurar el stock si el pedido pasa a Rechazado.

---

## 3. Glosario para Desarrolladores Junior

- **Badge (Insignia / Etiqueta visual)**: Pequeño componente visual con bordes redondeados y colores característicos (verde, rojo, amarillo) que indica el estado actual de un elemento a simple vista.
- **Enum (Enumeración)**: Lista fija de valores constantes permitidos para una variable o campo (por ejemplo, los estados válidos que puede tener un pedido en el sistema).
- **Mapeo (Mapping)**: Función o diccionario que traduce un código interno técnico (ej. `'PAID'`) a una etiqueta legible y amigable para el usuario (ej. `'Aprobado'`).
- **Sincronización de Estados**: Proceso mediante el cual nos aseguramos de que el estado del pedido (`order.status`) y el estado del pago (`payment.status`) se mantengan alineados y no muestren información contradictoria.

