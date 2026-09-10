# Plan de Refactorización: Separación Modular de Archivos (.html, .css, .ts) y Flip 3D

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Módulo**: Frontend (Estructura de Componentes Angular)

---

## 1. Objetivo
1. Implementar el visualizador 3D interactivo **Windows Flip 3D** en el Hero Banner de la página de inicio.
2. Modularizar la arquitectura de componentes de Angular separando cada componente en tres archivos independientes para facilitar la lectura y el aprendizaje de desarrolladores junior:
   - `*.component.html`: Estructura y marcado visual.
   - `*.component.css`: Estilos, animaciones y transformaciones 3D dedicadas.
   - `*.component.ts`: Lógica de negocio, estados y suscripciones en TypeScript.

---

## 2. Glosario Técnico (Para Desarrolladores Junior)

| Término | Definición Simplificada |
| :--- | :--- |
| **Separation of Concerns (Separación de Responsabilidades)** | Principio de desarrollo que dicta que el diseño visual (HTML), el maquillaje estilístico (CSS) y el cerebro lógico (TypeScript/JS) deben estar en archivos separados para que el código sea limpio y fácil de mantener. |
| **`templateUrl` & `styleUrls`** | Propiedades del decorador `@Component` de Angular que le indican al framework en qué archivos externos buscar el HTML y el CSS del componente. |
| **Windows Flip 3D (Win + Tab)** | Efecto visual 3D icónico con tarjetas inclinadas en profundidad y perspectiva dinámica para rotar entre los productos del catálogo. |

---

## 3. Plan de Archivos a Crear y Actualizar

### Módulo Inicio (`features/home/`)
- `home.component.html`: Maqueta con el Hero Flip 3D, categorías y destacados.
- `home.component.css`: Reglas 3D (`perspective`, `transform-style: preserve-3d`, `rotateY`, `translateZ`, reflejos Aero Glass).
- `home.component.ts`: Lógica del carrusel Flip 3D (navegación, cálculo de posiciones tridimensionales y agregado al carrito).

### Módulos Complementarios Separados
- `features/products/`: `products.component.html`, `products.component.css`, `products.component.ts`, `product-detail.component.html`, `product-detail.component.css`, `product-detail.component.ts`.
- `features/categories/`: `categories.component.html`, `categories.component.css`, `categories.component.ts`.
- `features/cart/`: `cart.component.html`, `cart.component.css`, `cart.component.ts`.
- `layouts/`: `public-layout.component.html`, `public-layout.component.css`, `public-layout.component.ts`.
