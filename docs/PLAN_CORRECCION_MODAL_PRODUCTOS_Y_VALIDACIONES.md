# Plan de Corrección: Posicionamiento de Modal de Productos, Aislamiento de Interacción y Sistema de Validación Visual

**Fecha:** 3 de Octubre de 2026  
**Módulo:** `frontend/src/app/features/admin-products`  
**Estado:** Propuesta / Pendiente de Aprobación  

---

## 1. Diagnóstico y Problemas Detectados

1. **Superposición del Header sobre la Ventana Flotante (Modal):**
   - **Causa:** El contenedor del modal en `admin-products.component.html` utilizaba `z-50`. Sin embargo, el encabezado (`<header>`) en `admin-layout.component.html` tiene `sticky top-0 z-40` y el sidebar `z-50`. Al encontrarse el modal renderizado dentro del `<main>` del layout, el contexto de apilamiento o la falta de un índice de capas (`z-index`) significativamente superior provocaba que el Header tapara la cabecera del modal.
   - **Solución:** Elevar el `z-index` del modal a `z-[100]`, asegurar un centrado absoluto con `fixed inset-0 flex items-center justify-center p-4`, fijar `overflow-y-auto` en el contenedor y bloquear el desplazamiento del fondo (`body`).

2. **Aislamiento de la Interacción y Salida Restringida:**
   - **Causa:** Se requería garantizar que no existan interacciones no deseadas fuera de la ventana flotante y que la salida esté restringida exclusivamente a los botones explícitos: **"Cancelar"** o **"Guardar Producto"**.
   - **Solución:** Establecer un telón de fondo oscuro con desenfoque (`bg-mate-950/80 backdrop-blur-md z-[100]`) que capture y bloquee todos los clics externos (sin acción de cierre al hacer clic fuera), eliminar elementos ambiguos y centralizar las acciones únicamente en los botones de "Cancelar" y "Guardar Producto".

3. **Validación de Entradas con Marco Rojo con Gradiente y Mensajes Emergentes ("Pop Message"):**
   - **Causa:** Los campos no tenían una validación visual reactiva que alertara de inmediato si un tipo de dato no coincide (por ejemplo, letras en campos de costo, precio o stock, o nombre vacío) antes o durante el envío.
   - **Solución:**
     - Implementar un sistema de estado de validación para cada campo (`touched`, `errors`).
     - Diseñar un estilo de borde con gradiente rojo (`linear-gradient(135deg, #ef4444, #f43f5e, #dc2626)`) con resplandor suave (`ring` y `box-shadow` rojizo).
     - Incorporar un componente visual emergente ("Pop Message / Tooltip") con animación suave de rebote/aparición (`animate-pop-in`) y flecha indicadora, mostrando el motivo exacto del error en lenguaje claro.

---

## 2. Glosario para Desarrolladores Juniors

Para facilitar la comprensión de los términos técnicos empleados en este plan:

- **Modal / Ventana Flotante:** Una ventana superpuesta que aparece sobre el contenido principal de la aplicación para solicitar información o confirmar una acción, requiriendo la atención del usuario.
- **Backdrop (Telón de fondo):** La capa semitransparente u oscura que se coloca detrás del modal para cubrir el resto de la página y enfocar la atención en el formulario.
- **Z-Index (Índice Z):** Propiedad de CSS que controla el orden de apilamiento vertical de los elementos en una página web. Un elemento con un `z-index` más alto se dibuja por encima de uno con un `z-index` más bajo.
- **Stacking Context (Contexto de Apilamiento):** Regla del navegador que agrupa elementos en tres dimensiones; si un elemento padre tiene un nivel bajo, ninguno de sus hijos podrá colocarse por encima de elementos externos de mayor jerarquía a menos que se aísle o se ajuste el nivel de capas.
- **Pop Message (Mensaje Emergente / Tooltip):** Un pequeño globo o tarjeta de texto informativo que "salta" o flota al lado de un campo cuando se detecta un error o cuando se necesita aclarar algo al usuario.
- **Data Binding (Vinculación de Datos):** La conexión bidireccional entre las variables de TypeScript (el código) y los campos HTML (la vista).

---

## 3. Especificación de Validaciones por Campo

| Campo | Regla de Validación | Mensaje de Error ("Pop Message") |
| :--- | :--- | :--- |
| **Nombre del Producto** | Requerido, no vacío, mínimo 3 caracteres. | *"El nombre es obligatorio y debe tener al menos 3 caracteres."* |
| **Categoría** | Requerido (debe haber una categoría seleccionada). | *"Debes seleccionar una categoría para clasificar el producto."* |
| **Precio Venta (Bs.)** | Requerido, número decimal mayor a 0 (no acepta letras ni números <= 0). | *"Ingresa un precio válido mayor a 0 (ej: 45.50)."* |
| **Costo (Bs.)** | Requerido, número decimal mayor o igual a 0. | *"El costo debe ser un número mayor o igual a 0."* |
| **Stock Inicial / Ajuste** | Requerido, número entero (en creación >= 0; en edición entero válido). | *"El stock debe ser un número entero válido (ej: 10)."* |
| **Imágenes** | Formatos JPG, PNG o WEBP, máx 5MB por archivo. | *"El archivo no cumple con el formato o supera los 5MB."* |

---

## 4. Archivos a Modificar (Sujetos a Autorización)

1. [admin-products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.html)
2. [admin-products.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.ts)
3. [admin-products.component.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-products/admin-products.component.css)
4. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) *(para actualizar el registro de cambios una vez aplicado)*
