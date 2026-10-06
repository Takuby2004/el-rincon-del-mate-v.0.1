# 📋 Plan de Desarrollo: Unificación de Estadísticas en la Sección "Dashboards" y Visualización Gráfica (Barras e Histogramas)

**Fecha:** Octubre 2026  
**Módulo:** Panel de Control Administrativo (Backoffice)  
**Objetivo:** 
1. Integrar todas las métricas comerciales, operativas y financieras en una única sección consolidada llamada **"Dashboards"**, eliminando la sección independiente de "Estadísticas" del menú y del enrutador.
2. Incorporar representaciones visuales interactivas mediante **gráficos de barras e histogramas de distribución** para facilitar la toma de decisiones al dueño de la tienda.

---

## 1. 🎯 Diagnóstico y Justificación

Tener dos secciones separadas ("Dashboard" y "Estadísticas") fragmentaba la visualización de la información. La unificación permitirá al administrador tener una visión 360° en un solo panel de control. Además, la adición de gráficos visuales (barras e histogramas) transforma tablas numéricas frías en información intuitiva, accesible y de lectura inmediata.

---

## 2. 📊 Especificación de Gráficos e Histogramas a Implementar

### A. Histograma de Distribución Temporal de Ventas (Últimos 7 Días)
- **Tipo:** Histograma de frecuencia temporal por barras verticales.
- **Función:** Representa la frecuencia y volumen de ventas aprobado en cada uno de los últimos 7 días.
- **Detalle:** Barras con gradiente terroso/dorado, etiquetas de día (`Lun`, `Mar`, `Mié`...) y tooltips dinámicos con el monto recaudado.

### B. Histograma de Distribución de Montos por Pedido (Ticket Promedio por Rangos)
- **Tipo:** Histograma de frecuencias por intervalos cuantitativos (*Bins*).
- **Rangos:** `Bs. 0 - 100`, `Bs. 101 - 250`, `Bs. 251 - 500`, `Bs. 500+`.
- **Función:** Revela el comportamiento de gasto de los compradores y en qué rango de precio se concentra el mayor volumen de compras.

### C. Gráfico de Barras Comparativo Financiero (Ingresos vs Costos vs Ganancia Neta)
- **Tipo:** Gráfica de barras horizontales comparativas de doble lectura (absoluta en Bs. y relativa en %).
- **Función:** Visualiza de un vistazo la proporción de los costos de inventario frente a los ingresos totales y la ganancia neta generada.

### D. Gráfico de Barras de Rendimiento de Productos (Top 5 Más Vendidos)
- **Tipo:** Barras horizontales progresivas con ranking (#1 a #5).
- **Función:** Compara el volumen de unidades vendidas y el capital generado por cada uno de los productos líderes de la tienda.

### E. Gráfico de Barras de Distribución Operativa de Pagos
- **Tipo:** Barra de distribución porcentual segmentada (Aprobados, Pendientes, Rechazados).

---

## 3. 🛠️ Arquitectura y Modificaciones de Archivos

### 1. Backend (`backend/src/services/stats.service.ts`)
- Enriquecer `getDashboardStats()` para generar:
  - `dailySalesHistory`: Datos diarios agregados de los últimos 7 días.
  - `orderDistribution`: Conteo y porcentaje de órdenes por rangos de monto de compra.
  - `profitMarginPercentage`: Cálculo preciso del margen de utilidad neta.

### 2. Modelos Frontend (`frontend/src/app/core/models/models.ts`)
- Actualizar la interfaz `DashboardStats` con los nuevos campos de gráficos e histogramas.

### 3. Vistas y Componente Dashboard (`frontend/src/app/features/dashboard/`)
- `dashboard.component.ts`: Métodos de cálculo de porcentajes y formato para los gráficos SVG y barras HTML5 con Tailwind.
- `dashboard.component.html`: Nueva maquetación estética premium con:
  - Resumen operativo superior (KPI Cards).
  - Bloque de Finanzas y Salud Comercial con Gráficas de Barras comparativas.
  - Bloque de Histogramas (Ventas últimos 7 días + Distribución de Ticket por Rangos).
  - Ranking Top 5 Productos con barras de progreso.
  - Pronóstico Estadístico de Demanda a 30 días.

### 4. Barra Lateral de Navegación (`frontend/src/app/layouts/admin-layout.component.html`)
- Renombrar el enlace a `"Dashboards"`.
- Eliminar el enlace huérfano a `"Estadísticas"`.

### 5. Enrutamiento (`frontend/src/app/app.routes.ts`)
- Redirigir `/admin/estadisticas` a `/admin/dashboard`.
- Retirar la importación de `AdminStatisticsFeatureComponent`.

### 6. Documentación (`README.md`)
- Actualizar la documentación del proyecto con la nueva sección unificada de Dashboards con gráficas.

---

## 4. 📖 Glosario de Términos para Desarrolladores Juniors

1. **Histograma (Histogram):**
   - *Explicación sencilla:* A diferencia de un gráfico de barras común que compara nombres (como "Mate Imperial vs Termo"), un histograma agrupa datos numéricos en "cajas" o intervalos continuos (por ejemplo, cuántas personas compraron entre 0 y 100 Bs, cuántas entre 101 y 250 Bs, etc.) para ver la distribución y concentración de los datos.
2. **Intervalos / Bins en Estadística:**
   - *Explicación sencilla:* Son los cajones o rangos en los que clasificamos los números. Si tenemos 50 pedidos, en vez de ver 50 números sueltos, los agrupamos en rangos de precios para entender los hábitos de compra.
3. **KPI (Key Performance Indicator / Indicador Clave de Rendimiento):**
   - *Explicación sencilla:* Es un número clave muy importante que le dice al dueño cómo va el negocio rápidamente, como por ejemplo "Ganancia Neta" o "Pagos Pendientes de Verificación".
4. **SVG (Scalable Vector Graphics / Gráficos Vectoriales Escalables):**
   - *Explicación sencilla:* Son dibujos basados en matemáticas y código en lugar de imágenes de píxeles. Esto permite crear barras y líneas que nunca se ven borrosas, se adaptan a celulares y pantallas 4K, y pesan casi nada de memoria.
