# Plan de Implementación: Filtro por Costo para Gestión de Productos

**Fecha:** 3 de Octubre de 2026  
**Módulo:** `frontend/src/app/features/admin-products`  
**Estado:** Propuesta / Pendiente de Aprobación  

---

## 1. Objetivo

Añadir un filtro por **Costo (Bs.)** al sistema de búsqueda y filtrado de la vista administrativa de productos, permitiendo al dueño filtrar el catálogo según el rango de inversión/costo unitario de adquisición de los productos.

---

## 2. Especificación Técnica

### A. Opciones del Selector de Rango de Costo
* **Cualquier Costo (`Todos`)**
* **Hasta Bs. 30 (`30`)**
* **Hasta Bs. 50 (`50`)**
* **Hasta Bs. 100 (`100`)**
* **Hasta Bs. 200 (`200`)**
* **Más de Bs. 200 (`over200`)**

### B. Opciones de Ordenamiento Adicionales
* **Costo: Menor a Mayor (`cost_asc`)**
* **Costo: Mayor a Menor (`cost_desc`)**

### C. Integración Reactiva
* El costo se integrará en la función evaluadora `get filteredProducts()`.
* Se incluirá en la comprobación del botón reactivo `Limpiar Filtros` y en la función `clearFilters()`.

---

## 3. Glosario para Desarrolladores Juniors

- **Unit Cost (Costo Unitario):** El monto en dinero que le cuesta al negocio adquirir o producir una unidad del producto, a diferencia del precio de venta (lo que paga el cliente final).
- **Responsive Filter Grid:** Distribución de cajas en columnas flexibles que se adaptan automáticamente al tamaño de pantalla (móvil, tablet, escritorio) para que ningún filtro quede fuera de la vista.

---

## 4. Archivos a Modificar (Sujetos a Autorización)

1. [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html)
2. [admin-products.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.ts)
3. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md)
