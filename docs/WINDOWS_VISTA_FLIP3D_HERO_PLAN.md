# Plan de Desarrollo: Carrusel 3D Interactivo "Flip 3D" estilo Windows Vista para el Hero

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Módulo**: Frontend (`home.component.ts` & `styles.css`)

---

## 1. Concepto y Objetivo Visual
Reemplazar la imagen fija del Hero Banner en la página principal por un visualizador tridimensional interactivo inspirado en la emblemática función **Windows Flip 3D (Win + Tab)** de Windows Vista y Windows 7. 
Este componente mostrará todos los productos disponibles en una pila tridimensional de tarjetas con perspectiva isométrica, efecto de cristal (*Aero Glassmorphism*), reflejos y navegación interactiva fluida.

---

## 2. Glosario Técnico (Para Desarrolladores Junior)

| Término | Definición Simplificada |
| :--- | :--- |
| **Windows Flip 3D** | Efecto visual legendario de Windows Vista donde las ventanas abiertas se apilaban una detrás de otra en un ángulo de 3D inclinado para navegar entre ellas. |
| **CSS 3D Transform (`perspective` & `rotateY`)** | Propiedades de CSS que le dan profundidad al navegador. `perspective` define la distancia a los ojos del usuario y `rotateY` gira la tarjeta sobre su eje vertical como una puerta que se abre. |
| **`preserve-3d`** | Una instrucción de CSS que le dice al navegador: *"trata a los elementos hijos como objetos en un espacio 3D real, no como capas planas aplastadas"*. |
| **Aero Glassmorphism** | El estilo visual translúcido con desenfoque de fondo (*blur*), bordes brillantes y reflejos que caracterizaba a Windows Vista. |
| **Interpolación Matemática de Índice** | Calcular la distancia de cada producto con respecto al producto activo actual (por ejemplo: si el activo es el 2, el 3 está a +1 de distancia y el 1 a -1) para posicionarlo matemáticamente en el espacio 3D. |

---

## 3. Arquitectura y Plan de Implementación

### Paso 1: Utilitarios y Clases CSS 3D en `frontend/src/styles.css`
- Contenedor con `perspective: 1200px` y `transform-style: preserve-3d`.
- Clases de transición `transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, filter 0.6s ease`.
- Efecto Aero Glass con `backdrop-filter: blur(16px)` y reflejo degradado.

### Paso 2: Lógica Interactiva en `HomeFeatureComponent`
- Obtención de todos los productos disponibles desde `ApiService.getProducts({ activeOnly: true })`.
- Estado de índice activo (`currentIndex`) con métodos `nextProduct()`, `prevProduct()`, `goToProduct(index)`.
- Cálculo dinámico de transformaciones 3D:
  - **Tarjeta Activa (`offset === 0`)**: `transform: translateX(0) translateZ(0) rotateY(0deg) scale(1)`, opacidad `1`, sombra multicapa dorada y tarjeta de información interactiva completa.
  - **Tarjetas Siguientes (`offset > 0`)**: `transform: translateX(${offset * 45}px) translateZ(${-offset * 90}px) rotateY(-28deg) scale(${1 - offset * 0.08})`, opacidad reducida y desenfoque ligero.
  - **Tarjetas Anteriores (`offset < 0`)**: `transform: translateX(${offset * 45}px) translateZ(${offset * 90}px) rotateY(28deg) scale(${1 + offset * 0.08})`, opacidad reducida.
- Navegación al hacer clic sobre cualquier tarjeta trasera para traerla al frente de inmediato.
- Botones de control con flechas flotantes y selector de puntos (*dots*).

### Paso 3: Integración de Acciones Rápidas
- Cada tarjeta activa incluirá el badge con nombre, virola/descripción, precio en Bolivianos (Bs.), botón directo "Agregar al Carrito" y enlace al detalle `/productos/:slug`.
