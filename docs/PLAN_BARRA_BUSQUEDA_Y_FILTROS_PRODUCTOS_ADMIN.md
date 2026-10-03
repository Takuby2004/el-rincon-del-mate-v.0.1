# Plan de Implementación: Barra de Búsqueda y Filtros Avanzados para Gestión de Productos

**Fecha:** 3 de Octubre de 2026  
**Módulo:** `frontend/src/app/features/admin-products`  
**Estado:** Propuesta / Pendiente de Aprobación  

---

## 1. Objetivo

Implementar una barra de búsqueda y barra de filtros multidimensionales en la vista administrativa de **Gestión de Productos** (`admin-products`), conservando la misma estética artesanal, limpia y moderna utilizada en el módulo de **Gestión de Clientes**.

---

## 2. Componentes y Funcionalidades Propuestas

### A. Tarjetas de Métricas Rápidas (KPIs)
* **Total Productos:** Conteo global de productos en catálogo.
* **En Stock / Activos:** Cantidad de productos disponibles para la venta.
* **Agotados / Stock Crítico:** Cantidad de productos con stock igual a 0 o stock bajo (<= 5).
* **Resultados Filtrados:** Cantidad de ítems visibles según los filtros activos.

### B. Barra de Filtros y Búsqueda
1. **Búsqueda por Texto:** Input reactivo que filtra por nombre de producto, slug o descripción.
2. **Filtro por Categoría:** Selector desplegable con todas las categorías dinámicas (`Todas las Categorías`, `Mates`, `Termos`, etc.).
3. **Filtro por Estado:** Selector entre `Todos los Estados`, `Activo (Visible)` e `Inactivo (Oculto)`.
4. **Filtro por Stock:**
   - *Todos los niveles*
   - *Disponible (> 5 un.)*
   - *Stock Bajo (1 a 5 un.)*
   - *Agotado (0 un.)*
5. **Filtro por Rango de Precio Redondeado:**
   - *Cualquier Precio*
   - *Hasta Bs. 50*
   - *Hasta Bs. 100*
   - *Hasta Bs. 200*
   - *Hasta Bs. 500*
   - *Más de Bs. 500*
6. **Selector de Ordenamiento:**
   - *Más recientes*
   - *Precio: Menor a Mayor*
   - *Precio: Mayor a Menor*
   - *Stock: Mayor a Menor*
   - *Nombre (A - Z)*
7. **Botón de Limpiar Filtros:** Restablece instantáneamente todos los criterios con un solo clic.

### C. Estado Vacío (*Empty State*)
Si la búsqueda no arroja coincidencias, se presentará una tarjeta ilustrada con icono y botón de restablecimiento rápido.

---

## 3. Glosario para Desarrolladores Juniors

- **Filtering (Filtrado en Memoria):** Proceso de evaluar una lista de datos en el frontend mediante una función `.filter(...)` en TypeScript para mostrar solo aquellos elementos que cumplan con una o varias condiciones simultáneas.
- **KPI (Indicador Clave de Rendimiento):** Tarjetas métricas en la parte superior que muestran números resumen (ej: cuántos productos están agotados).
- **Empty State (Estado Vacío):** Vista amigable con mensaje e icono que se muestra cuando una tabla o lista no tiene elementos para desplegar, orientando al usuario sobre qué hacer.
- **Two-Way Data Binding:** Enlace bidireccional de Angular (`[(ngModel)]`) que actualiza la variable en el código en cuanto el usuario escribe o selecciona una opción en pantalla.

---

## 4. Archivos a Modificar (Sujetos a Autorización)

1. [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html)
2. [admin-products.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.ts)
3. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md)
