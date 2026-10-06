# 📄 Plan de Implementación: Formato Horizontal (Landscape) para Reportes Oficiales

Este documento detalla la reconfiguración geométrica y maquetación de los 4 reportes ejecutivos en PDF de **El Rincón del Mate** para visualización horizontal (*Landscape*).

---

## 1. 🔍 Diagnóstico del Problema Visual

En la versión previa en orientación vertical (*Portrait*):
* El ancho útil de página era de solo 500 puntos tipográficos.
* Códigos de pedido largos como `ORD-261006-C13FADB` se solapaban directamente sobre los nombres de los clientes (`...Ayda Villena Ramos`), haciendo ilegible la tabla.
* Nombres de ciudades largas como `"Ciudad de Tarija, Tarija"` quebraban en múltiples líneas forzadas, generando desalineación de filas.

---

## 2. 📐 Solución Técnica: Orientación Horizontal (*Landscape*)

Al inicializar `PDFKit` con:
```typescript
new PDFDocument({
  layout: 'landscape',
  size: 'A4',
  margin: 40
});
```

* **Ancho total disponible:** Se incrementa de ~595 pt a **841.89 pt** (ancho útil de **760 pt**, ganando un +52% de espacio horizontal).
* **Alto total de página:** Se reduce de ~842 pt a **595.28 pt** (alto útil de ~515 pt).
* **Ajuste de Paginación Obligatorio:** El umbral de salto de página (`doc.addPage()`) debe ajustarse de `y > 710` a `y > 500` para evitar que el texto se corte al final de la hoja horizontal.

---

## 3. 📊 Distribución de Columnas en Formato Horizontal

### 3.1. Reporte de Ventas
| Columna | Posición X | Ancho Asignado | Alineación |
| :--- | :--- | :--- | :--- |
| **Nº Pedido** | 40 | 180 pt | Izquierda (Espacio amplio para códigos UUID/prefijo) |
| **Cliente** | 230 | 200 pt | Izquierda |
| **Fecha** | 440 | 90 pt | Izquierda |
| **Ciudad** | 540 | 140 pt | Izquierda |
| **Monto Total** | 690 | 110 pt | Derecha |

### 3.2. Reporte de Costos
* Ancho ampliado para: Producto (220 pt), Categoría (120 pt), Stock (60 pt), Costo Unitario (100 pt), Val. Stock (120 pt), COGS Período (120 pt).

### 3.3. Reporte de Ganancias
* Ancho ampliado para: Producto (230 pt), Cant. Vendida (80 pt), Precio Venta Promedio (110 pt), Costo Unitario (100 pt), Ganancia Total (120 pt), Margen % (100 pt).

### 3.4. Reporte de Demandas
* Ancho ampliado para: Producto (230 pt), Stock (80 pt), Unidades Vendidas (80 pt), Demanda/Día (110 pt), Cobertura (110 pt), Estado Reposición (130 pt).

---

## 4. 🛠️ Archivo Afectado

* `backend/src/utils/pdfGenerator.ts`:
  - Reemplazo de inicialización por `layout: 'landscape', size: 'A4', margin: 40`.
  - Ampliación de cajas de métricas a 760 pt de ancho con distribución horizontal de 4 KPIs.
  - Reajuste de coordenadas `X`, `width` y umbrales de salto de página a `y > 500`.

---

## 5. 📖 Glosario de Términos (Para Juniors)

1. **Orientación Horizontal (*Landscape*):** Configuración en la que la hoja está "acostada" (el ancho es mayor que el alto). Es el estándar utilizado en hojas de cálculo y reportes ejecutivos con muchas columnas.
2. **Puntos Tipográficos (*Points / pt*):** La unidad de medida usada en el estándar PDF. 72 puntos equivalen exactamente a 1 pulgada (2.54 cm).
3. **Salto de Página (*Page Break*):** Instrucción que detecta cuándo el cursor vertical `y` se acerca al margen inferior de la hoja para agregar una página nueva en blanco y reiniciar el cursor arriba.
