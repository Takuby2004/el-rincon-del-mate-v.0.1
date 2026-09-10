# Plan de Auditoría y Desarrollo: Adaptación Responsive Mobile-First (Frontend)

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Módulo**: Frontend (Responsive Design, Navegación Móvil & UI/UX Táctil)

---

## 1. Diagnóstico de la Experiencia Móvil Actual

1. **Header y Navegación Pública**:
   - En pantallas pequeñas (`< 768px`), los enlaces de navegación ("Inicio", "Productos", "Categorías") se ocultan con `hidden md:flex`, pero no existía un **Menú Hamburguesa desplegable (Drawer móvil)** para permitir la navegación táctil.
   - El acceso al "Panel Dueño" estaba oculto en móviles con `hidden sm:flex`.

2. **Visualizador Flip 3D en Pantallas Pequeñas**:
   - El contenedor de la escena 3D tenía anchos fijos que podían provocar desbordamiento lateral (*horizontal scroll*) en pantallas estrechas (360px - 412px).
   - Requiere adaptación de escala, reducción del ángulo de inclinación 3D en móviles (`rotateY(-20deg)`) y botones táctiles con tamaño mínimo de 44x44px.

3. **Formularios, Filtros y Tablas**:
   - En el catálogo, los filtros de búsqueda y categoría deben apilarse de forma ergonómica para el pulgar.
   - En el carrito y checkout, los botones de acción deben ocupar el ancho completo con padding cómodo.
   - En las vistas administrativas, las tablas de pedidos y productos requieren desplazamiento táctil horizontal suave (`overflow-x-auto` con `-webkit-overflow-scrolling: touch`).

---

## 2. Glosario Técnico (Para Desarrolladores Junior)

| Término | Definición Simplificada |
| :--- | :--- |
| **Responsive Web Design (Diseño Responsivo)** | Técnica de diseño que hace que una página web se adapte de forma inteligente y fluida a cualquier tamaño de pantalla (computadora, tablet o celular). |
| **Mobile Drawer (Menú Hamburguesa)** | Un menú lateral o desplegable que se abre al tocar el icono de las 3 rayitas (hamburguesa) en celulares, permitiendo navegar sin ocupar espacio en pantalla. |
| **Breakpoints (Puntos de Quiebre)** | Límites de tamaño de pantalla en CSS/Tailwind (como `sm: 640px`, `md: 768px`, `lg: 1024px`) a partir de los cuales el diseño cambia su estructura. |
| **Touch Target (Área Táctil Mínima)** | El tamaño mínimo que debe tener un botón o enlace en celulares (al menos 44x44 píxeles) para que una persona pueda pulsarlo fácilmente con el dedo sin equivocarse. |
| **Viewport & Horizontal Overflow** | El área visible de la pantalla. El desbordamiento horizontal ocurre cuando un elemento es más ancho que la pantalla del celular y crea una molesta barra de scroll lateral. |
| **CSS Backdrop Filter (Desenfoque)** | Efecto translúcido de cristal esmerilado que desenfoca lo que hay detrás del menú móvil cuando se abre, dándole un acabado visual elegante. |

---

## 3. Plan de Implementación

### Paso 1: Layout Público y Menú Hamburguesa Móvil
- **`public-layout.component.html` & `.ts`**:
  - Añadir botón de menú hamburguesa con icono animado `fa-bars` / `fa-xmark`.
  - Implementar menú móvil desplegable (*drawer*) con fondo translúcido, enlaces a Inicio, Productos, Categorías, Carrito y botón destacado para el **Panel Dueño**.
  - Ajustar el Topbar superior para que los números de WhatsApp de Tarija y La Paz se muestren en dos botones compactos y cómodos para tocar con el pulgar.

### Paso 2: Adaptación del Flip 3D en Móviles
- **`home.component.css` & `.html`**:
  - Ajustar media queries responsivas `@media (max-width: 640px)` para la escena 3D:
    - Escena adaptable `max-width: 100%`, `height: 380px`.
    - Tarjeta activa de `270px x 330px`.
    - Botones de navegación `<` y `>` flotantes bien posicionados para el pulgar.

### Paso 3: Optimización Táctil en Catálogo, Detalle y Carrito
- **`products.component.html`**: Filtros en columna en móvil y en fila en escritorio.
- **`product-detail.component.html`**: Ficha técnica responsiva (1 columna en móvil, 2 en escritorio) y botón de compra de ancho completo.
- **`cart.component.html`**: Tarjetas de producto en carrito reorganizadas para que los controles `+` y `-` y el botón de eliminar sean fáciles de pulsar con una sola mano.

### Paso 4: Tablas Administrativas Responsivas
- Contenedores con scroll horizontal táctil suave para las tablas de productos y pedidos en móvil.
