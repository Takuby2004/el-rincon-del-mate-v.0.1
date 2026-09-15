# 📁 Registro de Implementación: Subida de Imágenes Reales para Categorías

**Fecha:** Septiembre 2026  
**Módulo:** Gestión de Categorías (Frontend & Backend)  
**Estado:** ✅ Implementado y Validado

---

## 1. 🎯 Cambios Realizados

### 1.1. Backend
* **Rutas (`backend/src/routes/category.routes.ts`):**
  * Se configuró el middleware de Multer `upload.single('image')` en las rutas `POST /api/categories` y `PUT /api/categories/:id`.
* **Controlador (`backend/src/controllers/category.controller.ts`):**
  * Al crear o editar una categoría, si se recibe un archivo `req.file`, se almacena en disco en la carpeta `/uploads/categories/` mediante `FileStorageService.saveFile(req.file, 'categories')` y se asigna su URL relativa a la categoría.
  * Si se edita sin subir una foto nueva, se preserva la imagen existente.

### 1.2. Frontend
* **Vista de Categorías (`frontend/src/app/features/admin-categories/admin-categories.component.ts`):**
  * **Tabla:** Añadida una columna visual con la miniatura de la foto de la categoría usando el pipe `| assetUrl` y la directiva de resiliencia `[appImgFallback]`.
  * **Formulario Modal:** Se sustituyó el campo de texto de URL por una **zona de carga Dropzone**:
    * Soporta arrastrar y soltar archivos o examinar con el explorador.
    * Valida tipos de archivo (`JPG`, `PNG`, `WEBP`) y tamaño máximo (5MB).
    * Previsualización instantánea (*Preview*) de la foto seleccionada.
    * Muestra la foto actual al editar con opción de reemplazarla.
    * Indicador visual de estado ("Guardando...") durante la carga.

---

## 2. 📖 Glosario de Conceptos para Desarrolladores Juniors

* **FormData:**  
  * *Explicación sencilla:* Es un objeto especial de JavaScript que empaqueta campos de texto y archivos binarios (fotos) juntos para enviarlos por internet al servidor en una sola petición.
* **Dropzone:**  
  * *Explicación sencilla:* Es el área interactiva que detecta cuando arrastras un archivo con el mouse desde tu computadora y lo sueltas en el navegador.
* **FileReader:**  
  * *Explicación sencilla:* Es una herramienta del navegador que lee el archivo seleccionado en tu computadora y genera una URL temporal (`data:image/...`) para que puedas ver la foto en pantalla antes de guardarla.
