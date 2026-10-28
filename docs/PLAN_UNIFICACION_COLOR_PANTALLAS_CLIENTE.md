# Plan Maestro de Implementación: Transformación Completa "Dark Luxury" en Toda la Vista del Cliente

**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Storefront / Vistas Públicas del Cliente (Layout, Catálogo, Categorías, Detalle, Carrito, Checkout y Pedidos)  
**Fecha:** 27 de Octubre de 2026  
**Estado:** ✅ COMPLETADO E IMPLEMENTADO EXITOSAMENTE  

---

## 1. Diagnóstico y Objetivo Global

### Diagnóstico
La vista principal (**Home**) cuenta con una línea de diseño prémium llamada **Dark Luxury**: fondo verde bosque ultra oscuro (`bg-mate-950` / `#0a140d`), tarjetas con efecto vidrio esmerilado (`bg-mate-900/80 backdrop-blur-md`), bordes en tonos dorados/madera (`border-wood-500/25`), tipografías blancas y botones en gradiente cálido de cuero/madera (`from-wood-500 to-wood-600`).

Sin embargo, el resto del Storefront (Navbar, Catálogo, Categorías, Detalle de Producto, Carrito, Checkout y Confirmación de Pedido) se encontraba bajo la plantilla clara anterior (`bg-cream-50`, navbar blanca, tarjetas blancas). Esto producía un salto visual abrupto y poco homogéneo.

### Objetivo
Extender la estética **Dark Luxury** a **todas y cada una de las pantallas de la experiencia de compra del cliente**, garantizando contraste de lectura impecable, micro-animaciones fluidas y una experiencia visual prémium de punta a punta.

---

## 2. Paleta de Tokens y Directrices Visuales (Dark Luxury)

| Elemento | Clase Tailwind / Valor Hex | Uso en el Sistema |
| :--- | :--- | :--- |
| **Fondo Base Global** | `bg-mate-950` (`#0a140d`) | Fondo principal de todas las páginas y del `body` |
| **Tarjetas y Contenedores** | `bg-mate-900/80 backdrop-blur-md` (`#142618` al 80%) | Bloques de contenido con efecto translúcido |
| **Bordes de Tarjeta** | `border border-wood-500/25` / `hover:border-wood-400/60` | Borde dorado sutil que responde al cursor |
| **Títulos Principales** | `text-white font-black` | Alta legibilidad y contraste |
| **Acentos Dorados** | `text-wood-400` / `from-wood-300 to-wood-200` | Palabras clave y etiquetas de colección |
| **Textos Secundarios** | `text-mate-200` / `text-mate-300` | Descripciones descansadas para la vista |
| **Botones Primarios** | `bg-gradient-to-r from-wood-500 to-wood-600 hover:from-wood-600 hover:to-wood-700 text-white font-extrabold shadow-lg shadow-wood-950/40` | Acciones principales ("Comprar", "Agregar", "Continuar") |
| **Botones Secundarios / Ojo** | `bg-mate-950/60 hover:bg-wood-500/20 text-wood-300 hover:text-white border border-wood-500/30` | Acciones secundarias y vistas previas |
| **Inputs y Formularios** | `bg-mate-950/90 text-white placeholder-mate-500 border border-wood-500/30 focus:ring-wood-500` | Campos de entrada oscuros y accesibles |
| **Insignia "En Stock"** | `bg-emerald-950/80 text-emerald-400 border border-emerald-500/30` | Píldora de stock disponible |
| **Insignia "Agotado"** | `bg-red-950/80 text-red-400 border border-red-500/30` | Píldora de stock agotado |
| **Skeletons Oscuros** | `.skeleton-box-dark` (`rgba(20, 38, 24, 0.85)` + shimmer) | Siluetas de precarga elegantes |

---

## 3. Alcance Específico por Pantalla y Archivo

### A. Estilos Globales y Layout Base
* **[styles.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/styles.css):**
  - Configurar `body` con fondo `#0a140d` y texto `#ffffff`.
  - Agregar `.skeleton-box-dark` para estados de carga oscuros.
  - Ajustar scrollbar a fondo oscuro `#0a140d` con tirador dorado `#b88950`.
* **[public-layout.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/layouts/public-layout.component.html):**
  - Contenedor raíz: `bg-mate-950 text-white min-h-screen flex flex-col`.
  - Header / Navbar: `bg-mate-950/90 backdrop-blur-md border-b border-wood-500/20 shadow-xl`.
  - Nombre de marca en blanco con subtítulo dorado `text-wood-400`.
  - Enlaces de navegación con activo dorado `text-wood-400 border-b-2 border-wood-400`.
  - Botón Carrito: fondo `bg-mate-900/90 border-wood-500/30 text-wood-300`, badge dorado `bg-wood-500 text-white`.
  - Menú móvil desplegable: fondo oscuro `bg-mate-950/98` con bordes dorados.

### B. Catálogo de Productos
* **[products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/products.component.html):**
  - Barra de búsqueda y selector con fondo oscuro `bg-mate-900/80` e inputs `bg-mate-950/90`.
  - Tarjetas de producto idénticas a los "Productos Destacados" de la portada.
  - Reemplazo de skeletons claros por `.skeleton-box-dark`.
  - Estado vacío ("No se encontraron productos") estilizado en oscuro y dorado.

### C. Detalle de Producto
* **[product-detail.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/product-detail.component.html):**
  - Contenedor maestro: `bg-mate-900/80 backdrop-blur-md border-wood-500/25 shadow-2xl`.
  - Visor de imagen y miniaturas en recuadros `bg-mate-950/90 border-wood-500/20`.
  - Precio destacado en degradado dorado, selector de cantidad oscuro y botón de compra en gradiente cálido.

### D. Categorías de Productos
* **[categories.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/categories/categories.component.html):**
  - Grid de categorías: tarjetas `bg-mate-900/80 border-wood-500/25` con títulos blancos y enlaces dorados.
  - Vista interna por slug: cabecera oscura con miga de pan, botón volver dorado y grid de productos unificado.

### E. Carrito de Compras
* **[cart.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/cart/cart.component.html):**
  - Carrito vacío: tarjeta oscura con botón explorador dorado.
  - Ítems del carrito: tarjetas translúcidas con recuadro de imagen oscuro y controles de cantidad oscuros.
  - Tarjeta de Resumen de Compra: `bg-mate-900/90 border-wood-500/25`, totales destacados y botón a checkout en gradiente madera.

### F. Checkout - Datos del Cliente
* **[checkout.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/checkout/checkout.component.html):**
  - Indicador de pasos: paso 1 activo en dorado, conector oscuro.
  - Formulario: tarjeta `bg-mate-900/80 border-wood-500/25`.
  - Campos de entrada: `bg-mate-950/90 border-wood-500/30 text-white placeholder-mate-500`.

### G. Checkout - Pago QR y Comprobante
* **[checkout-payment.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/checkout/checkout-payment.component.html):**
  - Recuadro del QR bancario: marco blanco nítido y luminoso (crítico para que las aplicaciones bancarias puedan escanearlo sin errores).
  - Zona de carga de comprobante: borde discontinuo dorado `border-wood-500/40 bg-mate-950/60 hover:bg-mate-950/90`.
  - Botón confirmar pedido en gradiente madera/cuero.

### H. Confirmación y Detalle de Pedido
* **[order-detail.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/orders/order-detail.component.html):**
  - Tarjeta de orden: `bg-mate-900/80 border-wood-500/25`.
  - Desglose de productos con filas oscuras `bg-mate-950/90` y textos blancos/dorados.
  - Banners de estado de pago adaptados con fondos translúcidos legibles.

---

## 4. Archivos a Modificar
1. [styles.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/styles.css)
2. [public-layout.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/layouts/public-layout.component.html)
3. [products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/products.component.html)
4. [product-detail.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/product-detail.component.html)
5. [categories.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/categories/categories.component.html)
6. [cart.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/cart/cart.component.html)
7. [checkout.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/checkout/checkout.component.html)
8. [checkout-payment.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/checkout/checkout-payment.component.html)
9. [order-detail.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/orders/order-detail.component.html)
10. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md)
