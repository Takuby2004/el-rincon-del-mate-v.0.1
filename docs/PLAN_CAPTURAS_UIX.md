# Plan de Capturas de Pantalla UI/UX (Screenshots de Interfaces)

## 1. Resumen Ejecutivo y Factibilidad Técnica

**¿Es posible realizar las capturas solicitadas?**
**Sí, absolutamente.** Se ha implementado y ejecutado con total éxito el proceso automatizado de captura de pantalla (screenshots) de todas las interfaces del proyecto "El Rincón del Mate v0.1" en formato `.png`, almacenándose organizadas dentro de la ruta `/docs/UIX/`.

Para lograrlo de manera limpia, profesional y reproducible sin depender de capturas manuales que puedan variar en resolución o perder detalles, se implementó un flujo automatizado mediante un navegador en segundo plano (*Headless Browser*) con **Playwright** que recorrió cada ruta del frontend en Angular (puerto 4200) y exportó imágenes en alta definición (1080p Desktop y formato móvil).

---

## 2. Inventario Completo de Interfaces Capturadas

Las capturas se generaron en dos categorías de visualización (Escritorio y Móvil):
- **`/docs/UIX/desktop/`**: 20 capturas en resolución Full HD (1920x1080, escala retina 2x).
- **`/docs/UIX/mobile/`**: 18 capturas en resolución Responsive Móvil (375x812, escala retina 2x).

### A. Tienda Pública (E-commerce Cliente)
1. **01_home.png**: Portada principal (`/`), incluyendo el carrusel Hero con productos, destacados y footer.
2. **02_catalogo_productos.png**: Catálogo general (`/productos`) con barra de búsqueda y selector de categorías.
3. **03_detalle_producto.png**: Vista de ficha técnica de producto individual (`/productos/mate-imperial-calabaza-alpaca`), con selector de cantidad y botón de agregar al carrito.
4. **04_catalogo_categorias.png**: Vista general de categorías (`/categorias`).
5. **05_categoria_mates.png**: Vista de productos filtrados por una categoría específica (`/categorias/mates`).
6. **06_carrito_compras.png**: Vista del carrito (`/carrito`), mostrando el desglose de productos, cantidades y subtotal.
7. **07_checkout_datos.png**: Paso 1 del proceso de compra (`/checkout`), con el formulario de datos personales y entrega.
8. **08_checkout_pago.png**: Paso 2 del proceso de compra (`/checkout/pago`), con opciones de pago, visor del código QR y subida de comprobante.
9. **09_login_admin.png**: Pantalla de inicio de sesión administrativo (`/admin/login`).

### B. Panel Administrativo (Área Protegida `/admin` con Autenticación JWT)
10. **10_admin_dashboard.png**: Panel principal con métricas visuales de ventas, gráficos comparativos de capital, histogramas y accesos rápidos (`/admin/dashboard`).
11. **11_admin_productos.png**: Tabla y gestión de inventario de productos (`/admin/productos`), con filtros por stock, costo y categoría.
12. **12_admin_categorias.png**: Directorio y gestión de categorías (`/admin/categorias`), con tarjetas visuales e imágenes.
13. **13_admin_clientes.png**: Directorio y fidelización de clientes (`/admin/clientes`), con búsqueda por nombre, teléfono y correo.
14. **14_admin_pedidos.png**: Control general del flujo de pedidos (`/admin/pedidos`), con filtros por estado (Pendiente, Pagado, Enviado).
15. **15_admin_reportes.png**: Módulo analítico y generador de reportes de costos, ventas, ganancias y demandas (`/admin/reportes`).
16. **16_admin_pago_qr.png**: Módulo de administración y actualización del código QR de pagos bancarios (`/admin/configuracion/pago-qr`).
17. **17_admin_perfil.png**: Edición de datos y credenciales del administrador (`/admin/perfil`).

### C. Estados Interactivos y Modales
18. **18_modal_nuevo_producto.png**: Formulario modal emergente para dar de alta un nuevo producto con validaciones y subida de fotos. *(Desktop)*
19. **19_modal_nueva_categoria.png**: Formulario modal emergente para crear una nueva categoría. *(Desktop)*
20. **20_modal_previsualizar_reporte.png**: Visor modal de previsualización de reporte financiero. *(Desktop & Mobile)*

---

## 3. Estado de Ejecución y Archivos Generados

| Directorio | Cantidad de Capturas | Resolución | Formato |
| :--- | :---: | :---: | :---: |
| [`/docs/UIX/desktop/`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/docs/UIX/desktop) | 20 archivos | 1920 x 1080 px | PNG |
| [`/docs/UIX/mobile/`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/docs/UIX/mobile) | 18 archivos | 375 x 812 px | PNG |

**Total de interfaces registradas**: 38 capturas de pantalla de alta fidelidad.

---

## 4. Glosario de Términos para Desarrolladores Juniors

Para que los conceptos técnicos sean sencillos de comprender:

* **Screenshot (Captura de pantalla)**: Una imagen estática en formato digital (como PNG) que congela exactamente lo que se ve en la pantalla de una aplicación en un momento dado.
* **UI (User Interface / Interfaz de Usuario)**: Todos los elementos visuales con los que interactúa el usuario en una aplicación (botones, colores, tipografía, barras de menú, formularios).
* **UX (User Experience / Experiencia de Usuario)**: La sensación, facilidad, comodidad y lógica con la que el usuario navega y cumple tareas dentro de la aplicación.
* **Headless Browser (Navegador sin cabeza/sin interfaz gráfica)**: Un navegador web completo (como Chromium) que se ejecuta en segundo plano a través de código y comandos, sin abrir una ventana visible en la pantalla. Es ideal para tomar capturas automáticas y hacer pruebas.
* **Viewport (Área de visualización)**: El ancho y alto en píxeles que tiene la ventana del navegador (por ejemplo, 1920x1080 para computadoras de escritorio o 375x812 para teléfonos móviles).
* **Token JWT (JSON Web Token)**: Una "llave digital" o credencial segura que se guarda en el navegador cuando inicias sesión para demostrarle al servidor que estás autorizado a ver las pantallas de administrador.
* **Localhost**: La dirección que utiliza tu propia computadora para comunicarse consigo misma durante el desarrollo (por ejemplo `localhost:4200`).
* **Modal**: Una ventana o diálogo flotante que aparece por encima de la página principal y bloquea el fondo hasta que el usuario realiza una acción o lo cierra.
* **Slug**: La parte amigable y legible para humanos que identifica un recurso en una URL (por ejemplo, `/productos/mate-imperial-calabaza-alpaca` en lugar de `/productos/14589`).
