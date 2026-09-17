# Plan de Reordenamiento y Separación de Componentes Frontend (Angular)

Este documento detalla la estrategia para refactorizar la estructura de los componentes de la aplicación frontend en Angular, separando el código embebido (*inline template / styles*) en tres archivos individuales por componente:
1. **Lógica y Comportamiento**: `[nombre].component.ts`
2. **Estructura y Maquetación**: `[nombre].component.html`
3. **Estilos y Apariencia**: `[nombre].component.css`

---

## 1. Objetivos del Reordenamiento
- **Separación de Responsabilidades (*Separation of Concerns*)**: Cada archivo se enfoca en una sola tarea (lógica, diseño o estilo).
- **Mantenibilidad y Legibilidad**: Facilita la lectura de código evitando archivos `.ts` gigantes de cientos de líneas.
- **Productividad del Desarrollador**: Permite aprovechar al máximo las herramientas del editor (resaltado de sintaxis HTML/CSS, autocompletado y formateadores como Prettier).

---

## 2. Inventario de Componentes a Refactorizar

Se identificaron **21 componentes** en el frontend:

### A. Raíz y Layouts (3 componentes)
1. `src/app/app.component.ts` $\rightarrow$ Crear `app.component.html` y `app.component.css`.
2. `src/app/layouts/public-layout.component.ts` $\rightarrow$ Crear `public-layout.component.html` y `public-layout.component.css`.
3. `src/app/layouts/admin-layout.component.ts` $\rightarrow$ Crear `admin-layout.component.html` y `admin-layout.component.css`.

### B. Módulo de Autenticación (1 componente)
4. `src/app/features/auth/admin-login.component.ts` $\rightarrow$ Crear `admin-login.component.html` y `admin-login.component.css`.

### C. Vistas Públicas de la Tienda (8 componentes)
5. `src/app/features/home/home.component.ts` $\rightarrow$ Crear `home.component.html` y `home.component.css`.
6. `src/app/features/products/products.component.ts` $\rightarrow$ Crear `products.component.html` y `products.component.css`.
7. `src/app/features/products/product-detail.component.ts` $\rightarrow$ Crear `product-detail.component.html` y `product-detail.component.css`.
8. `src/app/features/categories/categories.component.ts` $\rightarrow$ Crear `categories.component.html` y `categories.component.css`.
9. `src/app/features/cart/cart.component.ts` $\rightarrow$ Crear `cart.component.html` y `cart.component.css`.
10. `src/app/features/checkout/checkout.component.ts` $\rightarrow$ Crear `checkout.component.html` y `checkout.component.css`.
11. `src/app/features/checkout/checkout-payment.component.ts` $\rightarrow$ Crear `checkout-payment.component.html` y `checkout-payment.component.css`.
12. `src/app/features/orders/order-detail.component.ts` $\rightarrow$ Crear `order-detail.component.html` y `order-detail.component.css`.

### D. Panel de Administración y Perfil (9 componentes)
13. `src/app/features/profile/profile.component.ts` $\rightarrow$ Crear `profile.component.html` y `profile.component.css`.
14. `src/app/features/dashboard/dashboard.component.ts` $\rightarrow$ Crear `dashboard.component.html` y `dashboard.component.css`.
15. `src/app/features/admin-products/admin-products.component.ts` $\rightarrow$ Crear `admin-products.component.html` y `admin-products.component.css`.
16. `src/app/features/admin-categories/admin-categories.component.ts` $\rightarrow$ Crear `admin-categories.component.html` y `admin-categories.component.css`.
17. `src/app/features/admin-orders/admin-orders.component.ts` $\rightarrow$ Crear `admin-orders.component.html` y `admin-orders.component.css`.
18. `src/app/features/admin-clients/admin-clients.component.ts` $\rightarrow$ Crear `admin-clients.component.html` y `admin-clients.component.css`.
19. `src/app/features/payment-qr-config/payment-qr-config.component.ts` $\rightarrow$ Crear `payment-qr-config.component.html` y `payment-qr-config.component.css`.
20. `src/app/features/statistics/statistics.component.ts` $\rightarrow$ Crear `statistics.component.html` y `statistics.component.css`.
21. `src/app/features/reports/reports.component.ts` $\rightarrow$ Crear `reports.component.html` y `reports.component.css`.

---

## 3. Estrategia Técnica de Implementación

Por cada componente:
1. **Extracción del Template**: Extraer el contenido dentro de `template: \`...\`` y almacenarlo en su archivo `.component.html` correspondiente.
2. **Creación de Hoja de Estilos**: Crear su `.component.css` correspondiente (y vincularlo para estilos específicos o futuros).
3. **Actualización del decorador `@Component`**:
   - Reemplazar `template: \`...\`` por `templateUrl: './[nombre].component.html'`.
   - Agregar `styleUrl: './[nombre].component.css'`.
4. **Verificación de Compilación**:
   - Ejecutar la verificación con el compilador de Angular para garantizar integridad absoluta.
