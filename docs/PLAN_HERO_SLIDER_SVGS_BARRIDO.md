# Plan de Implementación: Slider Hero con Barrido, Enfoque Centrado y Degradado Negro

**Fecha:** 13 de Septiembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Pantalla de Inicio (`/home`) - Sección Hero Principal  
**Estado:** ✅ IMPLEMENTADO Y VERIFICADO EXITOSAMENTE

---

## 1. Resumen y Requisitos
En la pantalla de inicio ([home.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html)):
1. **Colección de SVGs de Mates en `assets/`:**
   - `assets/producto_mate_16.svg` (Mate Imperial Premium)
   - `assets/producto_mate_18.svg` (Mate Camionero Tradicional)
   - `assets/producto_mate_27.svg` (Mate Torpedo Uruguayo)
   - `assets/producto_mate_31.svg` (Mate Imperial Guarda Especial)
2. **Enfoque y Centrado:** Encuadre y centrado perfecto en las figuras de los mates para que destaquen como piezas artesanales principales sin recortes ni deformaciones.
3. **Transición de Barrido cada 5 segundos:** Cambio automático temporizado a 5.000 ms con efecto de deslizamiento/barrido suave (`transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)`), soporte de pausa al pasar el cursor (`mouseenter`/`mouseleave`) y controles manuales (flechas anterior/siguiente y puntos interactivos).
4. **Degradado Negro en el Lado Izquierdo:** Capa de fusión degradada que va de mate negro sólido (`from-mate-950 via-mate-950/80 to-transparent`) a la izquierda hacia transparente a la derecha, manteniendo una lectura nítida del titular *"La Experiencia Auténtica del Buen Mate"*.

---

## 2. Archivos Modificados

1. **[`frontend/src/app/features/home/home.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.ts):**
   - Configuración de la interfaz `HeroSvgSlide` y array `heroSvgSlides` con los 4 SVGs y sus descripciones artesanales.
   - Temporizador automático configurado en `5000ms` (5 segundos) con métodos `startAutoSlide()`, `stopAutoSlide()`, `pauseAutoSlide()`, `resumeAutoSlide()`, `nextHeroSlide()`, `prevHeroSlide()` y `goToHeroSlide()`.
2. **[`frontend/src/app/features/home/home.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html):**
   - Estructura del slider con máscara izquierda de degradado negro, contenedor centrado para los mates con sombra y tarjeta inferior de detalles.
   - Botones de navegación con iconos y barra de puntos que muestra el mate activo y contador numérico `01 / 04`.
3. **[`frontend/src/app/features/home/home.component.css`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.css):**
   - Clases de animación para el barrido horizontal (`active-slide`, `prev-slide`, `next-slide`).
   - Micro-animación flotante `mate-float` para darle dinamismo a la pieza de mate.

---

## 3. Glosario Técnico (Nivel Junior)

1. **`object-contain`:** Propiedad de CSS que asegura que toda la ilustración del mate quepa perfectamente dentro del contenedor visible sin distorsionarse ni recortarse por los bordes.
2. **Intervalo (`setInterval` a 5000ms):** Función de JavaScript que ejecuta una acción repetitiva (en este caso, avanzar al siguiente mate) cada 5.000 milisegundos (5 segundos).
3. **Máscara de Degradado (`linear-gradient`):** Capa semitransparente oscura ubicada a la izquierda del slider para que el texto publicitario principal del Hero se lea con total claridad y contraste sin importar la ilustración de fondo.
4. **Efecto de Barrido (Sweep / Slide):** Transición visual fluida donde el mate actual se desliza hacia un lado mientras el nuevo mate entra suavemente desde el lado opuesto utilizando aceleración suave de curvas Bézier.

