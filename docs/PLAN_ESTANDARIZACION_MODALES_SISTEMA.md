# 🪟 Plan de Estandarización Integral de Modales en el Sistema

Este documento define la arquitectura y el estándar uniforme de diseño, jerarquía de capas, aislamiento de interacción y experiencia de usuario para todos los modales del panel administrativo de **El Rincón del Mate** (Categorías, Clientes, Pedidos y Reportes), tomando como referencia el estándar de oro implementado en **Productos**.

---

## 1. 🎯 El Estándar de Referencia ("Modal de Productos")

El modal de la sección Productos (`admin-products`) destaca por 5 características clave:
1. **Desanidado del Bloque de Contención (*Containing Block*):** El modal se renderiza fuera de cualquier contenedor con `animation` o `transform`, permitiendo que `fixed inset-0` cubra el 100% de la ventana (*Viewport*) sin cortes ni solapamientos con el Header.
2. **Jerarquía Superior de Capas (`z-[100]`):** Garantiza que el modal y su fondo oscuro queden firmemente por encima del Header (`z-40`) y cualquier otro elemento.
3. **Telón de Fondo Premium (*Backdrop Blur*):** Fondo envolvente `bg-darkness-950/80 backdrop-blur-md` que enfoca la atención y bloquea distracciones visuales.
4. **Validación Reactiva con Marcos con Gradiente y Mensajes Emergentes (*Pop Error Badges*):** Bordes con gradiente rojo (`linear-gradient`) y leves sacudidas (*shake*), acompañados de globos flotantes que explican el error en lenguaje claro (para formularios).
5. **Aislamiento y Salida Controlada:** `$event.stopPropagation()` para evitar pérdidas accidentales de datos y soporte para la tecla **Escape (Esc)**.

---

## 2. 📋 Diagnóstico y Mejoras Específicas por Sección

### 2.1. 🗂️ Sección "Categorías" (`admin-categories`)
* **Problema:** El modal de Crear/Editar está atrapado dentro del div animado, usa `z-50`, backdrop suave y carece de validación reactiva por campos.
* **Solución:**
  * Renderizar `@if (showModal)` al final de la plantilla (fuera del contenedor `animate-fade-in`).
  * Elevar a `z-[100]` con `bg-darkness-950/80 backdrop-blur-md`.
  * Incorporar `.input-error-gradient` y `.pop-error-badge` para validación reactiva del nombre obligatorio.
  * Añadir listener para cierre rápido con tecla `Esc`.

---

### 2.2. 👥 Sección "Clientes" (`admin-clients`)
* **Estado Actual:** Actualmente no existe ningún modal en esta sección.
* **Solución (Modal Informativo de Ficha del Cliente):**
  * Crear un **Modal de Ficha y Detalle de Cliente** (`selectedClient`):
    * Permite al administrador hacer clic en cualquier fila de cliente o en un nuevo botón de inspección para desplegar una ventana elegante a pantalla completa con su perfil 360°.
    * **Datos consultados:** Nombre completo, fecha de registro, avatar con iniciales, correo electrónico con enlace mailto, número de teléfono/WhatsApp con enlace directo, CI/NIT oficial, dirección física completa y ciudad de residencia.
    * **Métricas del Cliente:** Resumen del historial de pedidos acumulados.
    * Renderizado fuera del contenedor animado en `z-[100] bg-darkness-950/80 backdrop-blur-md`.
    * Cierre con botón o tecla `Esc`.

---

### 2.3. 📦 Sección "Pedidos" (`admin-orders`)
* **Problema:** Los modales de Detalle del Pedido (`selectedOrder`), Rechazo con Motivo (`showRejectModal`) y Notificación por Correo (`showEmailModal`) usan `z-50` y están dentro del div animado.
* **Solución:**
  * Mover los 3 modales fuera del bloque con `animate-fade-in`.
  * Estandarizar a `z-[100]` con `bg-darkness-950/80 backdrop-blur-md`.
  * Asegurar bordes redondeados `rounded-3xl` e iconos temáticos en cabecera.
  * Habilitar tecla `Esc` en todos los diálogos.

---

### 2.4. 📊 Sección "Reportes" (`reports`)
* **Problema:** El modal visor de PDF horizontal ya cuenta con `z-[100]`, pero está ubicado dentro del bloque raíz animado `space-y-8 animate-fade-in`.
* **Solución:**
  * Desanidar `@if (previewModalOpen)` al final del archivo HTML para garantizar que el cálculo de `90vh` se haga sobre el viewport 100% puro.
  * Aplicar `backdrop-blur-md` idéntico al de productos.

---

## 3. 🛠️ Archivos a Modificar

1. [admin-categories.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.html)
2. [admin-categories.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.ts)
3. [admin-categories.component.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.css)
4. [admin-clients.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-clients/admin-clients.component.html)
5. [admin-clients.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-clients/admin-clients.component.ts)
6. [admin-orders.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.html)
7. [admin-orders.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts)
8. [reports.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/reports/reports.component.html)
9. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md)

---

## 4. 📖 Glosario de Términos (Para Juniors)

1. **Containing Block (Bloque de Contención):** La caja imaginaria que usa el navegador como referencia para posicionar un elemento. Si un padre tiene animaciones o transformaciones (`transform: translateY(...)`), los elementos hijos con `position: fixed` quedan atrapados dentro de ese padre en vez de ocupar toda la pantalla del monitor.
2. **Backdrop Blur:** Desenfoque gausiano aplicado a la capa trasera de una ventana emergente, creando un efecto de vidrio esmerilado (*Glassmorphism*) que centra la atención del usuario en el contenido principal.
3. **Esc Keydown Listener:** Función que detecta cuando el usuario presiona la tecla `Escape` en el teclado para cerrar la ventana sin necesidad de buscar el botón con el ratón.
4. **Data Validation Badges:** Pequeñas etiquetas que aparecen dinámicamente debajo de un campo de formulario para explicar con precisión por qué un dato no es válido antes de enviarlo.
