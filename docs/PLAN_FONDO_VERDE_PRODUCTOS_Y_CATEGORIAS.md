# Plan de Implementación: Fondo Verde Oscuro (Dark Luxury) en Pantallas de Productos y Categorías

**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos:** 
- `frontend/src/app/features/products/`
- `frontend/src/app/features/categories/`
- `frontend/src/styles.css`  
**Fecha:** 27 de Octubre de 2026  
**Estado:** 📋 PENDIENTE DE AUTORIZACIÓN DEL USUARIO  

---

## 1. Diagnóstico del Estado Actual

En la vista del cliente:
* **Pantalla de Inicio (`/`):** Utiliza un diseño de lujo oscuro (*Dark Luxury*) basado en el verde profundo `bg-mate-950` (`#0a140d`), tarjetas con efecto vidrio esmerilado `bg-mate-900/80`, bordes dorados/madera sutiles `border-wood-500/25` y textos en blanco/dorado.
* **Pantalla de Catálogo de Productos (`/productos`):** Muestra fondo crema claro (`bg-cream-50`), tarjetas blancas (`bg-white`) con borde crema y textos oscuros (`text-mate-900`).
* **Pantalla de Categorías (`/categorias`):** Muestra el mismo fondo claro con tarjetas blancas brillantes.

Este contraste causa una ruptura visual al navegar desde el inicio hacia el catálogo o las categorías.

---

## 2. Solución Propuesta (Alcance Acordado)

Aplicar la paleta y estética idéntica a la pantalla de inicio exclusivamente a las vistas de **Catálogo de Productos** y **Categorías de Productos**, asegurando legibilidad, contraste y elegancia:

1. **Envoltorio de Pantalla Completa:**
   * Envolver el contenido de `products.component.html` y `categories.component.html` en un contenedor `<div class="bg-mate-950 text-white min-h-[calc(100vh-140px)] py-10">` para que el fondo verde oscuro cubra toda la altura de la vista.

2. **Cabeceras y Tipografía:**
   * Títulos principales: `text-white font-black` con destello dorado en palabras clave.
   * Etiquetas superiores ("Catálogo Oficial", "Colecciones"): `text-wood-400 font-extrabold uppercase tracking-widest`.
   * Descripciones: `text-mate-200` y `text-mate-300`.

3. **Buscador y Selector de Categorías (`/productos`):**
   * Contenedor del buscador: `bg-mate-900/80 backdrop-blur-md border border-wood-500/25 shadow-xl`.
   * Input de texto: `bg-mate-950/90 text-white placeholder-mate-400 border border-wood-500/30 focus:ring-wood-500`.
   * Dropdown de selección: `bg-mate-950 text-white border border-wood-500/30 focus:ring-wood-500`.

4. **Tarjetas de Producto (Catálogo y Vista por Categoría):**
   * Contenedor de tarjeta: `bg-mate-900/80 backdrop-blur-md rounded-3xl overflow-hidden border border-wood-500/20 hover:border-wood-400/60 shadow-xl hover:shadow-2xl hover:shadow-wood-950/80 hover:-translate-y-2 transition-all duration-500 flex flex-col group`.
   * Zona de imagen: contenedor con fondo `bg-mate-950/80` y badge de precio flotante `bg-mate-950/90 text-wood-300 border border-wood-500/35`.
   * Nombre de producto: `text-white group-hover:text-wood-300 font-black`.
   * Categoría: `text-wood-400 font-black uppercase text-2xs`.
   * Botón "Agregar al Carrito": gradiente cálido de madera/cuero `bg-gradient-to-r from-wood-500 to-wood-600 hover:from-wood-600 hover:to-wood-700 text-white font-extrabold shadow-lg shadow-wood-950/40`.
   * Botón secundario de detalle ("Ver"): `bg-mate-950/60 hover:bg-wood-500/20 text-wood-300 hover:text-white border border-wood-500/30`.

5. **Tarjetas de Categorías (`/categorias`):**
   * Tarjetas translúcidas `bg-mate-900/80 backdrop-blur-md border border-wood-500/25 hover:border-wood-400/70 shadow-xl hover:shadow-2xl hover:-translate-y-2`.
   * Títulos en `text-white group-hover:text-wood-300` y textos descriptivos en `text-mate-300`.
   * Enlace "Explorar categoría" con icono dinámico dorado.

6. **Estilos Globales de Carga (`styles.css`):**
   * Definición de `.skeleton-box-dark` con fondo verde bosque oscuro `rgba(20, 38, 24, 0.85)` y onda de brillo suave para que el estado de carga armonice con el fondo oscuro.

---

## 3. Archivos a Modificar
1. [styles.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/styles.css) (Agregar clase `.skeleton-box-dark`)
2. [products.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/products.component.html)
3. [categories.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/categories/categories.component.html)
4. [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) (Actualización de documentación)
