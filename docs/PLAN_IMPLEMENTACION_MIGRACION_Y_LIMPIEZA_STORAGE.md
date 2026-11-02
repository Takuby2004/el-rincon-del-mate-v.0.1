# Plan de Implementación: Limpieza Automática de Storage y Script de Migración a Supabase

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Afectados:** `ProductService`, `CategoryService`, `FileStorageService`, `migrateImagesToSupabase`  

---

## 1. Objetivos Alcanzados

1. **Aprovechamiento y Ahorro Máximo de Cuota en Supabase Storage (Eliminación en Cascada):**
   - **En Productos:**
     - Al **eliminar un producto**: Se recopilan todas sus fotos asociadas (`imageUrl` y la galería completa en `images`) y se eliminan automáticamente del bucket de Supabase con `supabaseAdmin.storage.from(bucket).remove([objectPath])`.
     - Al **editar un producto**: Se detectan las fotos que el administrador quitó de la galería o reemplazó en la portada, liberando inmediatamente su espacio en la nube.
   - **En Categorías:**
     - Al **eliminar una categoría**: Se elimina su imagen del bucket en Supabase.
     - Al **editar una categoría**: Si se reemplaza la imagen existente por una nueva, la anterior es eliminada de Supabase Storage.

2. **Script de Migración en Lote a Supabase Storage (`npm run storage:migrate`):**
   - Creado [`backend/src/scripts/migrateImagesToSupabase.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/scripts/migrateImagesToSupabase.ts).
   - Lee todos los registros de la base de datos que aún apuntan a rutas locales en `/uploads/` (Productos, Categorías, Códigos QR y Comprobantes de Pago de Clientes).
   - Sube cada archivo binario físico al bucket de Supabase Storage.
   - Actualiza de forma atómica las URLs en PostgreSQL con la nueva URL pública de Supabase.

---

## 2. Archivos Modificados y Creados

| Archivo | Acción | Propósito |
| :--- | :--- | :--- |
| [`backend/src/services/product.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/product.service.ts) | Modificado | Conexión de limpieza automática en `update` y `delete`. |
| [`backend/src/services/category.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/category.service.ts) | Modificado | Conexión de limpieza automática en `update` y `delete`. |
| [`backend/src/utils/fileStorageService.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/utils/fileStorageService.ts) | Modificado | Normalización y sanitización de rutas para borrado seguro en Supabase. |
| [`backend/src/scripts/migrateImagesToSupabase.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/scripts/migrateImagesToSupabase.ts) | Creado | Script de migración en lote de imágenes locales a la nube. |
| [`backend/package.json`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/package.json) | Modificado | Agregado comando `"storage:migrate"`. |

---

## 3. Guía de Ejecución de la Migración

Para ejecutar la migración cuando tengas lista tu clave `SUPABASE_SERVICE_ROLE_KEY` en `backend/.env`:

```bash
cd backend
npm run storage:migrate
```

El script imprimirá un reporte detallado en consola con el conteo de imágenes migradas por cada entidad.

---

## 4. Glosario Técnico (Nivel Junior) 📚

* **Garbage Collection (Recolección de Basura de Almacenamiento):** Limpiar archivos que ya no se usan para no desperdiciar espacio ni pagar de más en el servicio en la nube.
* **Script de Migración:** Código que se ejecuta una sola vez para mover datos o archivos viejos al nuevo formato o destino.
* **Atómico (Atomic):** Una acción que se completa totalmente o no se hace nada, evitando que las cosas queden "a medias" si ocurre un error.
* **Sanitización de URL:** Limpiar caracteres extraños o parámetros de consulta (`?t=123`) de una dirección web para extraer el nombre exacto del archivo.

