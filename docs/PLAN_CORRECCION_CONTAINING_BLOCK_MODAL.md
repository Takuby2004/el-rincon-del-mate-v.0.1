# Plan de Corrección: Solución al Efecto de Contención del Modal (Containing Block) y Comportamiento del Panel Administrativo

**Fecha:** 3 de Octubre de 2026  
**Módulo:** `frontend/src/app/features/admin-products` & `frontend/src/app/layouts`  
**Estado:** Propuesta / Pendiente de Aprobación  

---

## 1. Diagnóstico Técnico de la Imagen Adjunta

En la captura de pantalla se observa que el fondo oscuro del modal no cubre la pantalla completa, sino únicamente un recuadro dentro del área principal, quedando cortado en la parte inferior y dejando visibles y descubiertos el Header y el Menú lateral.

### ¿Por qué ocurrió esto? (Causa Raíz)
En CSS moderno, cuando una etiqueta padre tiene una propiedad de `animation` o `transform` (en nuestro caso, la clase `animate-fade-in` en el `<div>` raíz de `admin-products.component.html` que usa `transform: translateY(...)`), el navegador crea un nuevo **"Containing Block" (Bloque de Contención)**.

Esto provoca que cualquier elemento hijo con `position: fixed` deje de calcular su tamaño con respecto a la ventana completa del navegador (*Viewport*) y pase a calcularse únicamente dentro de las dimensiones de ese `<div>`.

---

## 2. Solución Propuesta

1. **Eliminar el bloqueo de contención (*Containing Block*):**
   - Mover la directiva `@if (showModal)` fuera del contenedor con `transform`/`animate-fade-in` o desanidar la animación de posicionamiento global.
   - Con esto, `position: fixed; inset: 0;` tomará el 100% real de la ventana del navegador.

2. **Habilitar funcionalidad en el Panel Administrativo (Sidebar / Menú Lateral):**
   - Si se desea que el menú lateral (Panel Dueño) permanezca accesible y funcional mientras el modal está activo en el área de trabajo, se le otorga al `aside` (sidebar) una jerarquía `z-[110]`, permitiendo hacer clic en cualquier sección (Dashboard, Categorías, Clientes, etc.) para navegar sin trabas.
   - El área de contenido de la página actual queda completamente bloqueada y atenuada por el telón de fondo.

---

## 3. Glosario para Desarrolladores Juniors

- **Viewport (Ventana Gráfica):** El área visible total de la página web en la ventana del navegador del usuario.
- **Containing Block (Bloque de Contención):** La caja rectangular que el navegador usa como marco de referencia para calcular la posición y tamaño de un elemento.
- **Transform / Animation Trap:** Un fenómeno común en CSS donde aplicar `transform` o `animation` a un elemento padre "atrapa" a los elementos hijos con `position: fixed`, impidiéndoles ocupar toda la pantalla.
- **Sidebar (Barra Lateral):** El menú vertical izquierdo del panel de administración que contiene los enlaces de navegación ("Dashboard", "Productos", "Categorías", etc.).

---

## 4. Archivos a Modificar (Sujetos a Autorización)

1. [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html)
2. [admin-layout.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/layouts/admin-layout.component.html) *(si se requiere elevar el sidebar a z-[110])*
