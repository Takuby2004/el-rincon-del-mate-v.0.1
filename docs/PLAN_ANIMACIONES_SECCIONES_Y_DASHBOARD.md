# Plan de Implementación: Animaciones Fluidas en Secciones y Efecto Notorio en Dashboard

## 1. Contexto y Diagnóstico
La sección de **Pedidos** (`admin-orders`) cuenta con una animación fluida de entrada mediante la clase `animate-fade-in` (`translateY(12px) -> 0` y `opacity: 0 -> 1`), proporcionando una sensación de dinamismo y respuesta de alta gama.

El objetivo es:
1. Replicar la animación de entrada fluida en todas las secciones administrativas que aún no la tienen:
   - **Productos** (`admin-products`)
   - **Categorías** (`admin-categories`)
   - **Reportes** (`reports`)
   - **Estadísticas** (`statistics`)
2. Diseñar e implementar un efecto de animación **mucho más notorio, llamativo y escalonado (*staggered pop*)** específicamente para la sección de **Dashboard**:
   - Tarjetas de métricas que emergen con un rebote elástico suave (`animate-dashboard-pop` con `scale(0.94) translateY(28px) -> scale(1) translateY(0)`).
   - Retardo en cascada (*staggered delays*) para que las tarjetas vayan apareciendo secuencialmente una tras otra (0ms, 60ms, 120ms, 180ms).
   - Efecto de levitación interactiva (`hover-lift`) y resplandor al pasar el cursor.
   - Bloques de ranking y pronóstico con entrada suave coordinada.

---

## 2. Archivos a Modificar

| Componente | Archivo | Acción |
| :--- | :--- | :--- |
| **Estilos Globales** | [styles.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/styles.css) | Añadir la regla `@keyframes dashboardPop` y la clase utilitaria `.animate-dashboard-pop`. |
| **Dashboard** | [dashboard.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/dashboard/dashboard.component.html) | Aplicar la animación de entrada global, animaciones escalonadas a las tarjetas de métricas (`stagger-1` a `stagger-4`) y bloques de análisis (`stagger-5` y `stagger-6`). |
| **Productos** | [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html) | Agregar `animate-fade-in` al contenedor principal. |
| **Categorías** | [admin-categories.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.html) | Agregar `animate-fade-in` al contenedor principal. |
| **Reportes** | [reports.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/reports/reports.component.html) | Agregar `animate-fade-in` al contenedor principal. |
| **Estadísticas** | [statistics.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/statistics/statistics.component.html) | Agregar `animate-fade-in` al contenedor principal. |
| **Documentación** | [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) | Actualizar el registro del sistema de animaciones en la sección UI/UX. |

---

## 3. Glosario para Desarrolladores Juniors

- **Staggered Animation (Animación Escalonada / En Cascada):** Técnica de diseño donde un grupo de elementos (como tarjetas o filas) no aparecen todos al mismo tiempo, sino con una pequeña fracción de segundo de diferencia entre cada uno, creando un efecto fluido y elegante.
- **Keyframes (Fotogramas Clave de CSS):** Bloque de código que define cómo cambia una propiedad visual (como opacidad, tamaño o posición) a lo largo del tiempo (por ejemplo, del 0% al 100% de la animación).
- **Cubic-Bezier (Curva de Aceleración):** Fórmula matemática que define la velocidad y suavidad del movimiento, permitiendo que las animaciones tengan un inicio rápido y un frenado elástico natural en lugar de un movimiento lineal rígido.
