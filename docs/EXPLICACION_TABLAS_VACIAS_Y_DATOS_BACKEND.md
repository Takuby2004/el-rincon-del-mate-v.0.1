# Explicación Técnica: Tablas Vacías en Supabase y Origen de Datos

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**Consulta del Usuario:** ¿Por qué `Category` y `Product` están vacías en Supabase y de dónde saca los datos el sistema?

---

## 1. ¿Por qué las tablas `Product` y `Category` están vacías en Supabase?

En la captura de pantalla se observa que:
* Las tablas **fueron creadas exitosamente** por Prisma (se observa la tabla `_prisma_migrations`, `Product`, `Category`, `User`, etc.). Esto confirma que el backend sí está conectado a este proyecto de Supabase (`el-rincon-del-mate-db`).
* La tabla `User` sí tiene registros porque allí se crearon los usuarios de prueba y administración.
* Las tablas `Product` y `Category` dicen *"This table is empty"* porque **aún no se ha ejecutado el comando de siembra inicial de datos (Seed)** en esta base de datos remota de Supabase, ni se han creado productos manualmente desde el panel de administración.

---

## 2. ¿De dónde está sacando los datos el sistema?

### A. En la Pantalla de Inicio (`/` o `Home`):
El carrusel superior con fotos y nombres de mates (*"Mate Imperial Premium"*, *"Mate Camionero Tradicional"*, *"Mate Torpedo Uruguayo"*) proviene de una lista estática (hardcodeada) en el archivo [`frontend/src/app/features/home/home.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.ts) líneas 35 a 60 (`heroSvgSlides`). Son elementos visuales de diseño del Hero banner.

### B. En el Catálogo de Productos (`/productos`):
El componente [`frontend/src/app/features/products/products.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/products/products.component.ts) consulta al backend:
* `GET /api/categories`
* `GET /api/products`

El backend consulta a Supabase (`prisma.product.findMany()`) y, como las tablas en Supabase están vacías, **responde un arreglo vacío `[]`**. Por eso en el catálogo no aparece ningún producto dinámico todavía.

---

## 3. ¿Cómo poblar las tablas con datos reales o iniciales?

Existen 2 formas de cargar productos en Supabase:

### Opción 1: Ejecutar la Siembra Inicial Automática (Seed)
En la carpeta `backend`, ejecutar:
```bash
npm run prisma:seed
```
Esto creará automáticamente en Supabase:
* 3 Categorías: *Mates Artesanales*, *Termos Térmicos*, *Bombillas de Alpaca y Acero*.
* 4 Productos iniciales con stock, precios, imágenes SVG y códigos QR.
* Movimientos iniciales de inventario.

### Opción 2: Crear Productos desde el Panel Administrativo
Entrar a `http://localhost:4200/admin/productos` y hacer clic en **"+ Nuevo Producto"**. Al guardarlo, se insertará de inmediato en la tabla `Product` de Supabase.

