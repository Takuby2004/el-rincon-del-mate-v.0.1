# Plan de Ajuste Visual: Unificación de Color Verde en Sección "Productos Destacados"

**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Home Feature (`frontend/src/app/features/home/`)  
**Fecha:** 18 de Octubre de 2026  
**Estado:** ✅ COMPLETADO Y VERIFICADO  

---

## 1. Diagnóstico del Problema Visual

En la vista de inicio del cliente (`home.component.html`), la sección **"Productos Destacados"** actualmente muestra un color de fondo grisáceo apagado / salvia (`#78847c`), rompiendo la armonía visual verde oscuro prémium (*Dark Luxury*) presente en el resto de la página.

### Causa Raíz
* En la línea 182 de [home.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html#L182), la etiqueta `<section>` tiene asignada la clase:
  ```html
  <section class="relative bg-mate-900/50 text-white py-20 sm:py-24 border-b border-wood-500/20 overflow-hidden">
  ```
* El modificador `/50` aplica un **50% de opacidad (transparencia)** a la capa verde `bg-mate-900` (`#142618`).
* Al ser semitransparente, el color crema claro del fondo general (`bg-wood-50` / `bg-cream-50`) se mezcla (*color blending*) con el verde oscuro, resultando en un tono grisáceo/apagado en lugar del verde profundo esperado.

---

## 2. Comparativa de Secciones en la Vista Cliente

| Sección | Clase de Fondo Actual | Resultado Visual |
| :--- | :--- | :--- |
| **Hero Banner** (Slider principal) | `bg-mate-950` (`#0a140d`) | Verde noche profundo prémium |
| **Categorías Principales** | `bg-mate-950` (`#0a140d`) | Verde noche profundo prémium |
| **Productos Destacados** (Reportada) | `bg-mate-900/50` (50% opacidad) | ❌ Grisáceo / Salvia deslavado |
| **Por Qué Elegirnos** (Beneficios) | `bg-mate-950` (`#0a140d`) | Verde noche profundo prémium |

---

## 3. Propuesta de Solución

Sustituir la clase semitransparente `bg-mate-900/50` por el color de fondo sólido de la paleta corporativa:

### Opción Recomendada: `bg-mate-950`
* **Código:**
  ```html
  <section class="relative bg-mate-950 text-white py-20 sm:py-24 border-b border-wood-500/20 overflow-hidden">
  ```
* **Ventaja:** Unifica al 100% el fondo con las secciones superior e inferior (**Categorías** y **Beneficios**). Las tarjetas de producto (`bg-mate-900/80 backdrop-blur-md`) resaltan elegantemente sobre el fondo oscuro manteniendo un contraste perfecto y armonioso.

### Opción Alternativa: `bg-mate-900` (Sólido)
* **Código:**
  ```html
  <section class="relative bg-mate-900 text-white py-20 sm:py-24 border-b border-wood-500/20 overflow-hidden">
  ```
* **Ventaja:** Da un verde bosque profundo (`#142618`), ofreciendo una sutil diferenciación entre bloques sin decolorarse a gris.

---

## 4. Archivos a Modificar
* [home.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html#L182) (Línea 182).
* [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) (si corresponde documentar el cambio visual).
