# Auditoría Técnica: Ciclo de Vida de Imágenes, Almacenamiento y Limpieza en Supabase Storage

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Evaluados:** Productos, Categorías, Códigos QR de Pago y Comprobantes de Pedidos  

---

## 1. Localización Actual de las Imágenes en el Sistema

Actualmente coexisten dos orígenes de imágenes en el proyecto:

1. **Imágenes Semilla / Demo (SVG Estáticos):**
   - **Ubicación:** Guardadas físicamente en el frontend: [`frontend/src/assets/`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/assets/).
   - **En Base de Datos:** Guardadas como rutas relativas tipo `"assets/producto_mate_16.svg"`.
   - **Comportamiento:** Angular las compila como recursos estáticos y las sirve directamente desde el navegador sin pasar por la nube.

2. **Imágenes Subidas Previamente en Desarrollo Local:**
   - **Ubicación:** Disco local del servidor: [`backend/uploads/products/`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/uploads/products/).
   - **En Base de Datos:** Guardadas con ruta relativa local tipo `"/uploads/products/1789352111488-9zg4....jpg"`.
   - **Estrategia de Migración a Supabase:**
     - **Opción A (Recomendada para pocos ítems):** Re-subir las imágenes desde el panel de administración (`/admin/productos`), lo que disparará de inmediato la subida a Supabase Storage con URLs públicas definitivas.
     - **Opción B (Automática por Script):** Ejecutar un script de migración que lea los archivos de `backend/uploads/` y los suba en lote al bucket `el-rincon-del-mate`.

---

## 2. Eliminación de Imágenes al Borrar Productos o Categorías

### Diagnóstico Actual:
- **En `FileStorageService`:** El método `deleteFile(fileUrl)` **ya está implementado** y cuenta con la lógica para borrar archivos de Supabase Storage mediante `supabaseAdmin.storage.from(bucket).remove([objectPath])`.
- **En `ProductService.delete(id)` y `CategoryService.delete(id)`:** Actualmente **no invocan** a `deleteFile`. Al borrar un producto o categoría, se elimina el registro en PostgreSQL, pero el archivo binario permanece en el bucket de Supabase como "archivo huérfano".

### Plan de Mejora Propuesto:
1. Al eliminar un producto, extraer su `imageUrl` y su arreglo `images`, e invocar `FileStorageService.deleteFile(...)` para cada URL que pertenezca al bucket de Supabase.
2. Al eliminar una categoría, invocar `FileStorageService.deleteFile(category.imageUrl)`.

---

## 3. Estado de la Subida del Código QR de Pago

### Diagnóstico Actual:
- **Estado:** ✅ **100% Integrado con Supabase Storage**.
- En [`paymentQr.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/paymentQr.service.ts#L29), el método `uploadQr` delega en `FileStorageService.saveFile(file, 'payment-qr')`.
- Los archivos se almacenan en el bucket `el-rincon-del-mate` bajo la carpeta organizada `payment-qr/`.
- De igual forma, los comprobantes de pago de los clientes se almacenan en `payment-proofs/`.

---

## 4. Glosario Técnico para Desarrolladores Juniors 📚

1. **Recurso Estático (Static Asset):** Archivos que forman parte del código fuente de la página web (como logos, íconos SVG o estilos) y que no cambian a menudo. Se descargan junto con el código del sitio.
2. **Archivo Huérfano (Orphaned File):** Una foto o archivo que sigue ocupando espacio en la nube (Storage), pero cuya referencia en la base de datos ya fue borrada, por lo que nadie la está usando ni viendo.
3. **Cascada de Eliminación (Deletion Cascade):** Patrón donde al borrar un registro principal (el producto), el sistema se encarga de limpiar automáticamente todo lo que dependía de él (sus imágenes en la nube, sus movimientos de stock, etc.).
4. **Script de Migración en Lote:** Un pequeño programa que automatiza el traslado de muchos archivos de un lugar a otro (del disco local a la nube) y actualiza la base de datos de una sola vez.

