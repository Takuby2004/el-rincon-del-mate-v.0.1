# Plan de Implementación: Subida y Visualización de Múltiples Imágenes para Productos

**Fecha:** 13 de Septiembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Gestión de Productos, Galería Multimedia y Almacenamiento  

---

## 1. Resumen y Alcance
Se amplía el soporte de imágenes de producto para admitir **una galería de múltiples imágenes por producto**:
1. **Base de Datos (Prisma):** Agregar el campo `images String[] @default([])` al modelo `Product` para almacenar las rutas de todas las imágenes adicionales, manteniendo `imageUrl String?` como la imagen de portada/principal.
2. **Backend (Express + Multer):**
   - Middleware `upload.array('images', 8)` (permite subir hasta 8 imágenes a la vez en creación o edición).
   - Servicio de guardado masivo en `FileStorageService.saveFiles(files, 'products')`.
   - Control en edición para mantener imágenes existentes, agregar nuevas o eliminar específicas.
3. **Frontend (Angular 19):**
   - **Panel de Administración (`admin-products.component.ts`):**
     - Subida múltiple por arrastrar y soltar o selector de archivos.
     - Grilla interactiva de miniaturas de vista previa.
     - Indicador de "Imagen Principal / Portada" y botón para cambiar cuál es la portada.
     - Botón para eliminar imágenes individuales de la selección o de las ya guardadas.
   - **Detalle de Producto para el Cliente (`product-detail.component.html`):**
     - Galería interactiva con visor principal y carrusel/tira de miniaturas interactivas (thumbnails).
     - Botones de navegación anterior / siguiente.
     - Zoom suave y respaldo automático si alguna imagen falla.

---

## 2. Glosario Técnico (Nivel Junior)

1. **`String[]` (Arreglo de Cadenas en PostgreSQL):** Tipo de dato nativo en la base de datos que permite guardar una lista ordenada de textos (ej: `['/uploads/foto1.jpg', '/uploads/foto2.jpg']`) dentro de una sola columna sin requerir tablas intermedias pesadas.
2. **`upload.array('images', 8)`:** Configuración de Multer que permite recibir una lista de varios archivos binarios bajo el mismo nombre de campo `images`.
3. **Galería de Miniaturas (Thumbnails):** Fila de imágenes pequeñas debajo de la foto principal que permite al usuario hacer clic o pasar el ratón para cambiar la imagen que se ve en grande.
4. **Imagen Primaria / Portada:** La primera foto de la lista o la seleccionada explícitamente para mostrarse en las tarjetas del catálogo general y carritos.
