# Plan de Corrección: Restauración de Scroll e Inconsistencia de Imágenes

## 1. Diagnóstico de los Problemas Reportados

### Problema 1: La página carga en la parte inferior al entrar al detalle de un producto
- **Causa Raíz:** En aplicaciones SPA (Single Page Application) desarrolladas con Angular, el navegador no realiza una recarga completa de la ventana al cambiar de ruta (`/` -> `/productos/:slug`). Por defecto, el enrutador de Angular (`provideRouter`) mantiene la posición del scroll (`window.scrollY`) tal como estaba en la pantalla anterior.
- Al navegar desde la página de Inicio (donde el usuario hizo scroll hacia abajo ~1200px para llegar a la sección de "Productos Destacados"), la página de detalle del producto se abre manteniendo ese desplazamiento de 1200px, posicionando el viewport directamente en el pie de página o la parte inferior del contenedor.
- **Solución Técnica:** Configurar `withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })` dentro de `provideRouter` en `frontend/src/app/app.config.ts`. Esto garantiza que cada navegación a una nueva pantalla inicie en la parte superior `(0, 0)`, y si el usuario presiona "Atrás", restaure la posición previa.

---

### Problema 2: Las imágenes de los productos en Inicio no coinciden con las del Detalle de Producto
- **Causa Raíz:**
  1. En `frontend/src/app/features/home/home.component.ts`, existe una función privada `getProductDisplayImage(product)` que detecta si la URL de la base de datos es una foto de café de Unsplash (`photo-151725...`) o está vacía, y la reemplaza por ilustraciones vectoriales locales de mates (`assets/producto_mate_16.svg`, `producto_mate_27.svg`, `producto_mate_18.svg`, `producto_mate_31.svg`).
  2. En cambio, en `frontend/src/app/features/products/product-detail.component.ts`, la propiedad computada `allImages` leía directamente `product.imageUrl` de la base de datos sin aplicar ninguna equivalencia.
  3. Como la base de datos contiene URLs de muestra de café provenientes del seed inicial (`backend/prisma/seed.ts`), en el Home se mostraba la ilustración del mate artesanal y en el Detalle se mostraba la foto de café de Unsplash.
  4. La misma inconsistencia ocurre en el catálogo general (`/productos`) y en el carrito de compras.
- **Solución Técnica:**
  1. **Frontend:** Centralizar la resolución de imágenes de productos en un utilitario común (`frontend/src/app/core/utils/product-image.util.ts`) o unificar su lógica para que tanto `home.component.ts`, `product-detail.component.ts`, `products.component.ts` y `cart.component.ts` muestren exactamente la misma imagen artesanal para cada producto.
  2. **Backend / Base de Datos:** Actualizar `backend/prisma/seed.ts` para que los productos iniciales apunten de forma predeterminada a las ilustraciones de mate en lugar de URLs externas de café.

---

## 2. Plan de Implementación Paso a Paso

1. **Paso 1: Configuración de Router en Angular (`frontend/src/app/app.config.ts`)**
   - Importar `withInMemoryScrolling` de `@angular/router`.
   - Agregar `{ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }`.
2. **Paso 2: Creación de Utilidad Compartida de Imágenes (`frontend/src/app/core/utils/product-image.util.ts`)**
   - Definir función `resolveProductImage(product: Partial<Product> | null | undefined): string`.
   - Definir función `resolveProductImages(product: Partial<Product> | null | undefined): string[]`.
   - Mapear de forma determinista mates imperiales, torpedos, termos y bombillas a sus assets SVG.
3. **Paso 3: Integración en Componentes del Frontend**
   - `product-detail.component.ts`: actualizar `allImages` y `currentImageUrl` para usar la utilidad compartida.
   - `home.component.ts`: delegar `getProductDisplayImage` en la utilidad compartida.
   - `products.component.ts` / `.html`: utilizar la resolución uniforme de imágenes.
4. **Paso 4: Actualización del Seed en Backend (`backend/prisma/seed.ts`)**
   - Asignar los assets correspondientes a los 4 productos principales.
5. **Paso 5: Verificación y Compilación**
   - Ejecutar `pnpm run build` en el frontend para validar que no existan errores de compilación TypeScript.

