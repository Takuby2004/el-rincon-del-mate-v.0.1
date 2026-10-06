# 📊 Plan de Desarrollo: Sistema Especializado de Reportes (Costos, Ventas, Ganancias y Demandas)

Este documento describe la arquitectura, lógica de cálculo, filtros temporales, diseño visual y especificaciones técnicas para el módulo de **Reportes** en **El Rincón del Mate**.

---

## 1. 🎯 Diagnóstico y Necesidad

Actualmente, el sistema solo cuenta con una tarjeta básica para descargar el **Reporte General de Ventas**. Para una gestión comercial y contable completa, el panel administrativo requiere 4 reportes ejecutivos descargables en formato PDF con firma y membrete oficial, acompañados de un selector de período temporal:

1. **Reporte de Costos**: Auditoría de costos de adquisición de mercancía vendida (COGS) y valuación del inventario en bodega.
2. **Reporte de Ventas**: Análisis de facturación, volumen de pedidos pagados, clientes y ticket promedio.
3. **Reporte de Ganancias**: Comparativa financiera entre ingresos brutos y costos reales para determinar la ganancia neta y el margen de rentabilidad.
4. **Reporte de Demandas**: Monitoreo de rotación de productos, ritmo de consumo diario, días de stock restante y proyección de reabastecimiento.

---

## 2. ⏱️ Gestión de Períodos Temporales (Filtro Dinámico)

La interfaz contará con un selector de rango temporal que afectará la generación de los 4 reportes:
* **Últimos 7 días** (`days=7`): Vista operativa semanal de corto plazo.
* **Últimos 30 días** (`days=30`): Vista mensual estándar del ciclo comercial.
* **Todo el Histórico** (`days=all`): Consolidado acumulado global desde la puesta en marcha de la plataforma.

---

## 3. 🏗️ Arquitectura Técnica y Flujo de Datos

```
[ Frontend: Angular 19 ]
   ├── Selector de Rango Temporal (7 días, 30 días, Todo el histórico)
   ├── reports.component.html (4 Tarjetas temáticas con badges, descripciones y acciones)
   ├── reports.component.ts   (Gestión de descarga, estados de carga y notificaciones Toast)
   └── api.service.ts         (Peticiones HTTP tipo Blob con query param `days`)
           │
           ▼
[ Backend: Node.js + Express + TypeScript ]
   ├── report.routes.ts       (Rutas protegidas con authenticateToken + requireAdmin)
   ├── report.controller.ts   (Recepción de peticiones y envío de headers PDF)
   ├── report.service.ts      (Consultas agregadas y filtrado por fecha con Prisma ORM)
   └── pdfGenerator.ts        (Diseño vectorial y maquetación de PDFs con PDFKit)
```

---

## 4. 📋 Especificación Detallada de los 4 Reportes

### 4.1. 📦 Reporte de Costos (`GET /admin/reports/costs/pdf?days=...`)
* **Datos consultados:**
  * `Product`: Costo unitario (`cost`), existencias actuales (`stock`), categoría asociada.
  * `OrderItem`: Costo unitario congelado (`unitCost`), cantidad vendida en pedidos aprobados en el período seleccionado.
* **Métricas Principales:**
  * **Costo de Bienes Vendidos (COGS):** $\sum (\text{unitCost} \times \text{cantidad vendida})$.
  * **Capital Inmovilizado en Bodega:** $\sum (\text{cost} \times \text{stock actual})$.
  * **Costo Promedio de Adquisición** por ítem.
* **Estructura del PDF:**
  * Membrete corporativo y rango de fechas analizado.
  * Resumen global de inversión e inventario.
  * Tabla con: Producto, Categoría, Stock actual, Costo Unitario (Bs.), Valoración en Stock (Bs.), Costo Vendido Total (Bs.).

---

### 4.2. 💰 Reporte de Ventas (`GET /admin/reports/sales/pdf?days=...`)
* **Datos consultados:**
  * `Order` donde `payment.status == 'APPROVED'` dentro del rango de fechas.
  * `Client`: Nombre, correo, ciudad.
  * `OrderItem`: Detalle de productos y precios de venta.
* **Métricas Principales:**
  * **Ingresos Brutos Totales:** Suma de `order.total`.
  * **Total de Pedidos Aprobados**.
  * **Ticket Promedio (AOV):** $\text{Total Ingresos} / \text{Total Pedidos}$.
* **Estructura del PDF:**
  * Tarjetas de resumen en el encabezado.
  * Tabla transaccional: Nº Pedido, Cliente, Fecha, Cantidad de ítems, Método de pago, Monto Total (Bs.).

---

### 4.3. 📈 Reporte de Ganancias y Rentabilidad (`GET /admin/reports/profits/pdf?days=...`)
* **Datos consultados:**
  * Cruce entre Ingresos de pedidos aprobados (`subtotal` / `total`) y costos reales (`unitCost * quantity`) en el rango seleccionado.
* **Métricas Principales:**
  * **Ingresos Totales (Ventas)**.
  * **Costo Total Asociado**.
  * **Ganancia Neta (Utilidad Bruta):** $\text{Ingresos} - \text{Costos}$.
  * **Margen de Ganancia Porcentual:** $(\text{Ganancia Neta} / \text{Ingresos}) \times 100$.
* **Estructura del PDF:**
  * Resumen financiero contable.
  * Ranking de rentabilidad por producto: Precio de Venta vs Costo Unitario, Ganancia Unitaria, Unidades Vendidas, Ganancia Total Generada, Margen (%).

---

### 4.4. 📦 Reporte de Demandas y Rotación (`GET /admin/reports/demand/pdf?days=...`)
* **Datos consultados:**
  * Historial de órdenes aprobadas en el período y stock remanente en inventario.
* **Métricas Principales:**
  * **Unidades Totales Vendidas**.
  * **Velocidad de Demanda Diaria (Run Rate):** $\text{Unidades vendidas en período} / \text{días del período}$.
  * **Días de Cobertura de Stock:** $\text{Stock Actual} / \text{Demanda Diaria}$.
  * **Nivel de Alerta de Reposición:** Crítico (< 7 días), Alerta (7-15 días), Óptimo (> 15 días).
* **Estructura del PDF:**
  * Resumen de rotación global.
  * Tabla de inventario inteligente: Producto, Unidades vendidas en el período, Stock disponible, Demanda diaria estimada, Días de stock restantes, Estado de abastecimiento sugerido.

---

## 5. 🛠️ Archivos a Modificar

1. **`backend/src/utils/pdfGenerator.ts`**:
   - Funciones: `generateCostReportPdf`, `generateProfitReportPdf`, `generateDemandReportPdf`, y actualización de `generateSalesReportPdf`.
2. **`backend/src/services/report.service.ts`**:
   - Métodos asíncronos con filtrado por fecha (`days: number | 'all'`).
3. **`backend/src/controllers/report.controller.ts`**:
   - Endpoints con extracción de `req.query.days` y descarga de PDF.
4. **`backend/src/routes/report.routes.ts`**:
   - Rutas `/sales/pdf`, `/costs/pdf`, `/profits/pdf`, `/demand/pdf`.
5. **`frontend/src/app/core/services/api.service.ts`**:
   - Métodos con parámetro opcional `days?: number | string`.
6. **`frontend/src/app/features/reports/reports.component.ts`**:
   - Gestión de estado del selector temporal, carga individual (`loadingSales`, `loadingCosts`, `loadingProfits`, `loadingDemand`), y feedback con `ToastService`.
7. **`frontend/src/app/features/reports/reports.component.html`**:
   - Selector visual de período + Grid de 4 tarjetas de alto impacto visual con diseño Tailwind.
8. **`README.md`**:
   - Actualización de documentación con los nuevos reportes del sistema.

---

## 6. 📖 Glosario de Términos Complejos (Explicación para Juniors)

1. **COGS (Cost of Goods Sold / Costo de los Bienes Vendidos):** Es cuánto dinero le costó a la empresa comprar o fabricar exactamente los productos que ya vendió. No cuenta lo que sobra en el almacén, solo lo vendido.
2. **Margen de Ganancia (Profit Margin):** Es el porcentaje de cada boliviano de venta que nos queda libre después de restar los costos. Si vendes a 100 Bs y costó 60 Bs, ganas 40 Bs, teniendo un margen del 40%.
3. **Ticket Promedio (AOV - Average Order Value):** El monto promedio de dinero que gasta un cliente en una sola compra. Se calcula dividiendo la facturación total entre la cantidad de pedidos.
4. **Run Rate / Velocidad de Demanda:** Es la velocidad promedio a la que los clientes compran un producto (ej. "se venden 3 paquetes de yerba por día").
5. **Quiebre de Stock (Stockout):** Es cuando un cliente quiere comprar un producto pero ya no quedan unidades en el almacén, perdiendo la venta.
6. **Días de Cobertura:** El tiempo que nos durará el inventario actual antes de que se agote, asumiendo que los clientes sigan comprando al mismo ritmo.
7. **Buffer en Node.js:** Un espacio temporal en la memoria RAM del servidor donde se ensamblan los bytes binarios del archivo PDF antes de enviarlo por internet al navegador.
8. **Blob (Binary Large Object) en el Frontend:** Es la representación en JavaScript de un archivo binario (como una imagen o PDF). Permite que el navegador lo interprete y lo guarde en el disco duro del usuario como una descarga.
