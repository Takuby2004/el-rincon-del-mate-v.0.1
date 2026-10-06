# Diagnóstico Técnico: Estado de Carga Congelado en Gestión de Pedidos

## 1. Resumen Ejecutivo
Al ingresar al módulo de **Gestión de Pedidos** (`admin-orders`), la interfaz muestra en las tarjetas superiores las métricas actualizadas (`Total Pedidos: 8`, `Aprobados: 8`, `Ingresos Aprobados: Bs. 0.00`), pero el contenedor inferior donde debería listar los pedidos permanece congelado mostrando indefinidamente el mensaje:
> *"Cargando directorio de pedidos..."*

Este comportamiento no se debe a una falla de red ni a que el servidor backend se haya bloqueado, sino a una **excepción en tiempo de ejecución (Runtime TypeError)** dentro del ciclo de renderizado de Angular provocado por la serialización de tipos `Decimal` de la base de datos PostgreSQL.

---

## 2. Diagnóstico Técnico Detallado (Causa Raíz)

### A. Serialización de Decimales en Prisma
En el esquema de base de datos (`schema.prisma`), los campos monetarios de un pedido (`Order.total`, `Order.subtotal`, `OrderItem.unitPrice`, `OrderItem.subtotal`) están definidos como tipos `Decimal` de PostgreSQL:
```prisma
model Order {
  ...
  subtotal  Decimal @db.Decimal(12, 2)
  total     Decimal @db.Decimal(12, 2)
}
```
Cuando Node.js / Express convierte estos registros a formato JSON para enviarlos al navegador (`res.json(orders)`), la librería Prisma serializa los valores `Decimal` como cadenas de texto (`string`), por ejemplo: `"210"`, `"960"`, `"150.00"`.

### B. Concatenación Inadvertida de Cadenas en TypeScript
En el componente de Angular [`admin-orders.component.ts`](file:///frontend/src/app/features/admin-orders/admin-orders.component.ts), el cálculo de `totalRevenue` utiliza la función `reduce`:
```typescript
get totalRevenue(): number {
  return this.orders
    .filter((o) => o.paymentStatus === 'APPROVED' || o.status === 'PAID')
    .reduce((acc, o) => acc + o.total, 0);
}
```
Dado que `o.total` es un texto (`"615"`), JavaScript realiza una concatenación de cadenas en lugar de una suma numérica:
- Paso 1: `0 + "615"` $\rightarrow$ `"0615"`
- Paso 2: `"0615" + "150"` $\rightarrow$ `"0615150"`
- Resultado final: `"0615150501501270935960210"` (un texto gigante en lugar de un número).

### C. Colapso del Motor de Renderizado de Angular (Change Detection Crash)
En la plantilla HTML [`admin-orders.component.html`](file:///frontend/src/app/features/admin-orders/admin-orders.component.html#L72):
1. **Línea 72**: Se intenta formatear la tarjeta con:
   ```html
   <span class="text-xl font-black text-mate-900">Bs. {{ totalRevenue.toFixed(2) }}</span>
   ```
   Al ejecutarse `"0615150...".toFixed(2)`, JavaScript lanza de inmediato un error crítico:
   ```text
   TypeError: totalRevenue.toFixed is not a function
   ```
2. **Línea 168**: Además, en la tabla de pedidos, dentro de cada fila del bucle `@for`:
   ```html
   <td class="p-4 font-extrabold text-mate-900">Bs. {{ order.total.toFixed(2) }}</td>
   ```
   Cada `order.total` es también un texto, lo que genera idéntico `TypeError`.

### D. ¿Por qué se queda visible "Cargando directorio de pedidos..."?
1. Al iniciar la vista, `loading = true` y `orders = []`. Angular pinta el estado inicial: tarjetas en 0 y el spinner de carga `@if (loading)`.
2. Cuando el servicio HTTP recibe la respuesta del servidor, `this.orders` se llena con los 8 pedidos y `this.loading = false`.
3. Angular inicia la actualización del HTML (Change Detection). Comienza desde arriba:
   - Actualiza `Total Pedidos` $\rightarrow$ `8`.
   - Actualiza `Aprobados` $\rightarrow$ `8`.
   - Llega a la tarjeta de `Ingresos Aprobados` e intenta evaluar `totalRevenue.toFixed(2)`.
   - Se produce el `TypeError`.
4. El error interrumpe y aborta abruptamente la actualización del árbol del DOM en Angular. Los elementos situados más abajo (incluyendo la instrucción que debía ocultar el bloque `@if (loading)` y mostrar la tabla `@for`) **nunca se llegan a ejecutar**.
5. Por consiguiente, la pantalla queda congelada visualmente con el bloque de carga previo, creando la ilusión óptica de que el sistema sigue procesando la solicitud.

---

## 3. Plan de Solución Propuesto

1. **Normalización Numérica en el Frontend ([`admin-orders.component.ts`](file:///frontend/src/app/features/admin-orders/admin-orders.component.ts))**:
   - Mapear explícitamente `total: Number(o.total) || 0`, `subtotal: Number(o.subtotal) || 0` en `loadOrders()`.
   - Normalizar los precios y subtotales de cada ítem de la orden (`unitPrice`, `unitCost`, `subtotal`).
   - Proteger el getter `totalRevenue` para garantizar que la acumulación opere siempre sobre números (`Number(o.total) || 0`).

2. **Reemplazo de `.toFixed(2)` por el Pipe Seguro de Angular ([`admin-orders.component.html`](file:///frontend/src/app/features/admin-orders/admin-orders.component.html))**:
   - Reemplazar todas las invocaciones directas de `.toFixed(2)` en la plantilla por el pipe declarativo estándar de Angular: `{{ order.total | number:'1.2-2' }}` y `{{ totalRevenue | number:'1.2-2' }}`.
   - Aplicar el mismo pipe en la modal de inspección y comprobantes (`item.unitPrice`, `item.subtotal`, `selectedOrder.total`, `proofModalOrder.total`).

3. **Garantía en el Backend ([`order.service.ts`](file:///backend/src/services/order.service.ts))**:
   - Asegurar que `getAllOrders` devuelva los montos normalizados para que cualquier cliente API consuma valores numéricos limpios.

---

## 4. Implementación y Resultados de Validación

### Cambios Aplicados
1. **Backend ([`order.service.ts`](file:///backend/src/services/order.service.ts))**:
   - Implementación del método estático `OrderService.formatOrder()`.
   - Conversión de `total`, `subtotal`, `amount` y los campos de `items` (`unitPrice`, `unitCost`, `subtotal`) a tipo `number` en `getAllOrders()`, `getOrderById()`, `createOrder()` y `updateOrderStatus()`.
2. **Frontend ([`admin-orders.component.ts`](file:///frontend/src/app/features/admin-orders/admin-orders.component.ts))**:
   - Normalización explícita en `loadOrders()` con `Number(...) || 0`.
   - Corrección del acumulador en `totalRevenue` con `Number(o.total) || 0`.
   - Normalización de objetos en `openOrderModal()` y `openProofModal()`.
3. **Frontend ([`admin-orders.component.html`](file:///frontend/src/app/features/admin-orders/admin-orders.component.html))**:
   - Sustitución de `.toFixed(2)` en tarjetas, filas de tabla, modales y visualizador de comprobantes por el pipe reactivo `| number:'1.2-2'`.
4. **Módulo de Detalle Público ([`order-detail.component.ts`](file:///frontend/src/app/features/orders/order-detail.component.ts) y [`.html`](file:///frontend/src/app/features/orders/order-detail.component.html))**:
   - Blindaje idéntico aplicado a la consulta de órdenes públicas por número de pedido (`/pedido/:orderNumber`).

### Pruebas de Ejecución
- **Compilación TypeScript Backend**: Código de salida `0` (sin errores).
- **Compilación TypeScript Frontend**: Código de salida `0` (sin errores).
- **Prueba de Datos Reales (Base de Datos)**:
  - Total de pedidos recuperados: 8 pedidos.
  - Ingresos calculados exitosamente: `Bs. 4,340.00`.
  - Estados de comprobantes y listado de pedidos: 100% operativos sin interrupciones del motor de renderizado.
