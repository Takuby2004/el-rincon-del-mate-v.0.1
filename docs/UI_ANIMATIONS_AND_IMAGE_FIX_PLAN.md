# Auditoría y Plan de Implementación: Corrección de Imágenes y Animaciones Fluidas (Frontend)

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Módulo**: Frontend (Angular 17 + Tailwind CSS)

---

## 1. Diagnóstico y Hallazgos

1. **Gestión y Resiliencia de Imágenes**:
   - Si una imagen externa (como Unsplash) tarda en responder o falla por conectividad/CORS, el navegador muestra el icono genérico de imagen rota.
   - No existía una directiva de Angular para manejar transiciones suaves de carga (`fade-in` al terminar `(load)`) ni un reemplazo automático hacia un asset local embebido (`fallback`) cuando se dispara el evento `(error)`.
   - En `tailwind.config.js`, no estaba declarada la paleta de colores `wood`, a pesar de que varias plantillas de componentes la referenciaban (`text-wood-600`, `border-wood-200`), lo que generaba inconsistencias visuales.

2. **Experiencia de Usuario y Animaciones**:
   - Los estados de carga actuales usaban un spinner simple en lugar de **Skeleton Loaders** con efecto de brillo (*Shimmer*), provocando saltos de diseño abruptos (*Cumulative Layout Shift*).
   - Faltaban micro-animaciones en acciones clave (animación de rebote al añadir items al carrito, escalonamiento *staggered* al mostrar listas de productos, elevación de tarjetas con curvas Bézier suaves).

---

## 2. Glosario de Términos para Desarrolladores Junior

| Término | Definición Fácil de Entender |
| :--- | :--- |
| **Skeleton Loader (Cargador Esqueleto)** | Una silueta gris o dorada animada que imita la forma del contenido antes de que termine de cargarse. Evita que la pantalla parpadee o cambie de tamaño de golpe. |
| **Shimmer Effect (Efecto de Brillo)** | Una animación de gradiente de luz que pasa de izquierda a derecha sobre un skeleton, indicando al usuario que el sistema está trabajando activamente. |
| **Fallback de Imagen** | Una imagen de respaldo o plan B. Si la URL principal falla (por ejemplo error 404 o sin internet), la aplicación automáticamente muestra este gráfico en su lugar sin romper el diseño. |
| **Cubic-Bezier (Curva Bézier)** | Una fórmula matemática de aceleración de animación. En lugar de moverse a velocidad constante (que se ve robótica), inicia rápido y desacelera suavemente como un objeto físico real. |
| **Staggered Animation (Animación Escalonada)** | Cuando varios elementos (como tarjetas de productos) no aparecen todos al mismo milisegundo, sino uno tras otro con una fracción de segundo de diferencia, creando un efecto fluido de cascada. |
| **Data URI / SVG Embebido** | Un gráfico vectorial codificado directamente dentro del código. Garantiza que la imagen cargue al 100% de manera instantánea, incluso sin conexión a internet ni servidor backend activo. |
| **Angular Directive (Directiva)** | Una instrucción reusable que le añade superpoderes a un elemento HTML (como escuchar si la imagen falló y cambiarle el src en tiempo real). |

---

## 3. Arquitectura y Plan de Solución

### Paso 1: Configuración de Tokens y Paleta de Diseño
- Extender `tailwind.config.js` para incluir la gama de colores completa `wood` (tonos de madera artesanal y cuero) en armonía con `mate`, `gold`, `cream` y `darkness`.
- Añadir en `frontend/src/styles.css` las animaciones de keyframes y utilidades modernas:
  - `@keyframes shimmer` (efecto de carga fluido).
  - `@keyframes fadeInUp` (aparición suave desde abajo).
  - `@keyframes badgePop` (rebote interactivo en el carrito).
  - Clases `.skeleton-box`, `.hover-card-mate`, `.stagger-1` a `.stagger-6`.

### Paso 2: Directiva de Resiliencia de Imágenes (`ImgFallbackDirective`)
- Crear `frontend/src/app/shared/directives/img-fallback.directive.ts`:
  - Detecta estado de carga y añade efecto de opacidad suave.
  - Escucha el evento `(error)` del navegador y reemplaza la imagen automáticamente con un SVG artesanal optimizado del mate.
  - Previene bucles infinitos en caso de que el fallback también presente problemas.

### Paso 3: Implementación de Skeleton Loaders y Micro-Animaciones en Componentes
- **Catálogo (`products.component.ts`)**: Reemplazar spinner por grilla de 8 tarjetas skeleton con shimmer; añadir transiciones escalonadas al renderizar productos.
- **Página de Inicio (`home.component.ts`)**: Añadir transiciones suaves en banners, micro-animaciones al presionar botones y hover dinámico en categorías y productos destacados.
- **Detalle de Producto (`product-detail.component.ts`)**: Skeleton loader estructurado a 2 columnas; efecto zoom suave en la imagen principal y animación de éxito al presionar "Agregar al Carrito".
- **Categorías (`categories.component.ts`)**: Transición fluida entre vista general y vista filtrada.
- **Navegación y Layout (`public-layout.component.ts`)**: Micro-animación de rebote en el icono del carrito cuando se agrega un nuevo producto.

---

## 4. Plan de Validación
- Probar carga en frío con estados skeleton visibles.
- Simular fallo de URL de imagen y verificar que la directiva inserte el fallback visual sin errores en la consola.
- Validar fluidez de las animaciones a 60fps en desktop y móviles.
