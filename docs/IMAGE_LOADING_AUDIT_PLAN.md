# Auditoría y Plan de Desarrollo: Carga de Imágenes (Frontend & Backend)

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  

---

## 1. Resumen Ejecutivo de la Auditoría

Se realizó una auditoría completa del flujo de imágenes en el frontend (Angular) y backend (Express + Prisma). Se identificaron dos causas principales de fallo de carga visual:

1. **URL rota de Unsplash (`photo-1594750853874-9549f7b19688`)**:
   - Devuelve `HTTP Status 404 (Not Found)`.
   - Estaba configurada en la base de datos a través de `prisma/seed.ts` y se usaba como valor por defecto en los componentes de Angular (`products`, `product-detail`, `home`, `categories`, `cart`, `admin-products`).

2. **Resolución de Rutas Relativas (`/uploads/...`)**:
   - Los archivos subidos (QR bancario, comprobantes de pago) retornan la ruta `/uploads/...`.
   - En el frontend, al renderizar `<img [src]="url">`, la imagen apuntaba a `http://localhost:4200/uploads/...` en lugar del servidor backend en `http://localhost:3000/uploads/...`.

---

## 2. Glosario Técnico

| Término | Definición Simplificada |
| :--- | :--- |
| **HTTP 404** | Error de recurso no encontrado. El servidor no tiene ningún archivo o página en la URL solicitada. |
| **Ruta Relativa vs. Absoluta** | La ruta relativa empieza con `/` o `./` y se resuelve según el servidor del frontend (`localhost:4200`). La absoluta especifica el servidor completo (`http://localhost:3000/...`). |
| **Pipe de Angular** | Transformación reusable de datos en el template de Angular. Usado para convertir rutas relativas a URLs absolutas de backend. |
| **Fallback Image** | Imagen de repuesto usada en caso de que falle la carga de la imagen original. |

---

## 3. Plan de Implementación

### Fase 1: Backend & Base de Datos
- Actualizar `backend/prisma/seed.ts` con URLs de Unsplash comprobadas y activas.
- Re-ejecutar `npx prisma db seed`.

### Fase 2: Frontend (Angular)
- Crear el Pipe `AssetUrlPipe` en `frontend/src/app/shared/pipes/asset-url.pipe.ts` para resolver automáticamente URLs de imágenes locales y remotas.
- Actualizar los componentes del frontend para utilizar la nueva URL de respaldo y el pipe de resolución de imágenes.
- Implementar la directiva o evento de fallback `(error)` para evitar iconos de imagen rota si la conexión a la imagen falla.
