# Plan de Integración Visual: Extensión de la Estética Hero a las Secciones Inferiores

**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Home Feature (`frontend/src/app/features/home/`)  
**Fecha:** 17 de Octubre de 2026  
**Estado:** 📋 PLAN DETALLADO LISTO PARA APROBACIÓN  

---

## 1. Diagnóstico Actual (Auditoría Visual y Técnica)

Actualmente existe una notable desconexión estética y temática entre la sección superior (**Hero Banner**) y el resto de la página de inicio (**Categorías Principales**, **Productos Destacados** y **Beneficios**):

1. **Ruptura de Identidad Visual (Contraste Brusco):**
   - **Hero Superior:** Presenta una paleta de lujo oscuro (*Dark Luxury* en `#0a140d` / `mate-950`), degradados profundos de fusión, tipografía destacada con gradiente dorado/madera, insignias flotantes con efecto vidrio (*glassmorphism*) y alta elegancia artesanal.
   - **Sección Inferior ("Categorías Principales" y "Productos"):** Pasa abruptamente a fondos claros (`#f8f6f0` y `bg-wood-100/70`), con tarjetas blancas estándar y bordes tenues, luciendo desconectada y plana en comparación con la experiencia inmersiva del Hero.

2. **Incongruencia de Imágenes (Fotos de Café en vez de Mates):**
   - En las tarjetas de categorías y productos se están mostrando imágenes de café con leche y tazas de café espresso (provenientes de URLs de Unsplash cargadas en el seed inicial), en lugar de mates imperiales, bombillas de alpaca y termos de cuero.

---

## 2. Solución Aprobada: Integración Completa "Dark Luxury"

Se extenderá el diseño inmersivo del Hero hacia todas las secciones inferiores de la página de inicio para crear una experiencia visual continua, prémium y 100% auténtica:

### A. Sección "Categorías Principales"
- **Fondo:** Fondo oscuro `bg-mate-950` con sutiles resplandores o gradientes de fusión que continúan la atmósfera del Hero sin cortes abruptos.
- **Titulares:** Título con acento degradado dorado (`from-wood-300 via-wood-400 to-wood-200`) e insignia de categoría superior tipo badge con micro-animación.
- **Tarjetas Glassmorphism:** Cajas con fondo oscuro semitransparente (`bg-mate-900/80 backdrop-blur-md`), bordes con reflejos dorados (`border-wood-500/20`), zoom sutil en *hover* y botón inferior "Ver productos" con destello dorado.
- **Corrección de Imágenes:** Mapeo de categorías hacia las imágenes e ilustraciones de mates y accesorios artesanales auténticos (`assets/producto_mate_...svg` o fotografías especializadas de mates).

### B. Sección "Productos Destacados"
- **Fondo:** Capa profunda `bg-mate-900/50` con bordes divisorios sutiles en oro viejo (`border-wood-500/20`).
- **Tarjetas de Producto:** Tarjetas oscuras prémium con etiquetas flotantes de precio en dorado, badges de categoría en tipografía destacada y botones de "Agregar al Carrito" con gradiente dorado/madera (`from-wood-500 to-wood-600`).
- **Estados de Carga (Skeletons):** Skeletons oscuros adaptados con brillo dorado suave en lugar de cajas grises/claras.

### C. Sección "Por Qué Elegirnos" (Garantía y Envíos)
- **Tarjetas de Beneficios:** Tres módulos con fondo `bg-mate-900/80`, iconos dentro de contenedores dorados/bronce con resplandor suave (*glow*), tipografía clara y descripciones en tonos crema/mate suave.

---

## 3. Archivos Involucrados en la Implementación

1. [`frontend/src/app/features/home/home.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html):
   - Rediseño estructural de las 3 secciones inferiores con clases Tailwind para el tema oscuro prémium.
2. [`frontend/src/app/features/home/home.component.css`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.css):
   - Reglas de estilo para el efecto *glassmorphism*, bordes dorados reactivos y transiciones de elevación.
3. [`frontend/src/app/features/home/home.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.ts):
   - Mapeo de respaldo para garantizar que las categorías muestren imágenes de mates y no las imágenes temporales de café si la base de datos aún tiene las URLs antiguas.
4. [`README.md`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md):
   - Actualización de la documentación del proyecto con el nuevo diseño visual unificado.

---

## 4. Glosario Técnico para Desarrolladores Junior

Para comprender con exactitud cada concepto técnico involucrado:

1. **Dark Luxury (Lujo Oscuro):** Estilo de interfaz donde se usan tonos oscuros profundos (negro carbón, verde mate oscuro) combinados con detalles dorados o metálicos. Genera una percepción inmediata de exclusividad y alta gama.
2. **Glassmorphism (Efecto Vidrio Esmerilado):** Técnica de diseño lograda con `backdrop-filter: blur(...)` y fondos con transparencia (`rgba`). Hace que los elementos parezcan placas de vidrio flotantes sobre el fondo.
3. **Skeleton Loader:** Bloque gris o tenue con una animación de brillo que aparece temporalmente mientras se cargan los datos de una API, evitando que la pantalla se vea vacía o dé saltos bruscos.
4. **Hover-Lift:** Micro-animación que hace que un elemento (como una tarjeta) se eleve sutilmente unos píxeles (`translateY(-4px)`) y proyecte una sombra más profunda cuando el usuario coloca el puntero del mouse sobre él.
5. **Fallback:** Mecanismo de seguridad o respaldo en el código. Si una imagen no existe o tiene una URL rota o inapropiada (como las fotos de café), el sistema muestra automáticamente una imagen predeterminada correcta (un mate artesanal).
