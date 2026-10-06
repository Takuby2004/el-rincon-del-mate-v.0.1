# 📋 Plan de Desarrollo e Implementación - Fase 3 (El Rincón del Mate v0.2)

## 📌 Objetivos de la Fase 3
Esta fase culmina la atención de las prioridades **P1** detectadas en la auditoría técnica integral, enfocándose en la exactitud financiera, la seguridad perimetral de archivos subidos, la robustez en el manejo de excepciones y la escalabilidad del backend mediante paginación.

---

## 🎯 Puntos a Implementar

### 1. P1-6: Manejo Centralizado de Excepciones y Clase `AppError`
- **Diagnóstico previo:** Los errores en controladores y servicios devolvían respuestas HTTP 500 genéricas o capturas inconsistentes con `try-catch`, dificultando la diferenciación entre errores de cliente (400, 401, 403, 404, 409) y fallas no controladas del servidor.
- **Solución:**
  - Creación de la clase `AppError` en `backend/src/errors/AppError.ts` con propiedades `statusCode`, `message` e `isOperational`.
  - Métodos estáticos de conveniencia: `AppError.badRequest()`, `AppError.unauthorized()`, `AppError.forbidden()`, `AppError.notFound()`, `AppError.conflict()`.
  - Refactorización de `errorHandler` en `backend/src/middlewares/error.middleware.ts` para capturar `AppError`, errores de validación de `Zod`, violaciones de restricciones de `Prisma` (P2002 para registros duplicados, P2025 para recursos no encontrados) y errores 500 imprevistos de forma limpia y uniforme.

---

### 2. P1-4: Validación de Firmas Binarias (*Magic Bytes*) en Almacenamiento de Archivos
- **Diagnóstico previo:** La validación de archivos en Multer se limitaba al encabezado HTTP `Content-Type` y a la extensión del archivo, lo cual es vulnerable a suplantación (*MIME spoofing*), permitiendo subir binarios ejecutables o scripts maliciosos con extensión `.jpg` o `.png`.
- **Solución:**
  - Implementación de un detector de firmas binarias reales (*magic bytes*) en `backend/src/utils/fileStorageService.ts`:
    - **JPEG / JPG:** `FF D8 FF`
    - **PNG:** `89 50 4E 47 0D 0A 1A 0A`
    - **WEBP:** `52 49 46 46` (RIFF) + `57 45 42 50` (WEBP)
  - Si un archivo subido no coincide con estas firmas binarias, se rechaza inmediatamente antes de ser guardado en disco o en Supabase Storage.
  - Asignación segura de extensiones de archivo basada en el tipo de contenido real comprobado por los magic bytes.

---

### 3. P1-3: Precisión Monetaria Decimal en PostgreSQL y Prisma
- **Diagnóstico previo:** Los modelos `Product`, `Order`, `OrderItem` y `Payment` utilizaban el tipo `Float` en base de datos. En entornos contables y de comercio electrónico, los números en coma flotante IEEE 754 sufren imprecisiones de redondeo acumulativas (por ejemplo, `0.1 + 0.2 = 0.30000000000000004`).
- **Solución:**
  - Migración en `backend/prisma/schema.prisma` a `Decimal @db.Decimal(12, 2)` para:
    - `Product`: `price`, `cost`
    - `Order`: `subtotal`, `total`
    - `OrderItem`: `unitPrice`, `unitCost`, `subtotal`
    - `Payment`: `amount`
  - Ejecución de migración Prisma para aplicar los tipos exactos en PostgreSQL.
  - Asegurar que los servicios de negocio (`OrderService`, `ProductService`, `StatsService`, `ReportService`, `PdfGenerator`) conviertan de forma segura los valores numéricos garantizando compatibilidad total tanto con las reglas de negocio como con las interfaces de cliente del frontend.

---

### 4. P1-7: Paginación en Servidor (`page`, `pageSize`, `total`, `totalPages`)
- **Diagnóstico previo:** Las rutas `GET /api/orders`, `GET /api/products` y `GET /api/clients` consultaban todos los registros existentes sin límite de cantidad. A medida que la tienda crezca, esto aumentará el consumo de memoria y la latencia.
- **Solución:**
  - Creación de un helper de paginación universal en `backend/src/utils/pagination.ts`.
  - Integración en `OrderService.getAllOrders`, `ProductService.getAll` y `ClientService.getAll`.
  - Soporte bidireccional y retrocompatible:
    - Si se especifican `page` y `pageSize` en los parámetros de consulta, se retorna el objeto `{ items, total, page, pageSize, totalPages }` junto a cabeceras HTTP `X-Total-Count`, `X-Page`, `X-Total-Pages`.
    - Si no se especifican parámetros de paginación, se preserva la respuesta en array para no quebrar vistas existentes del frontend, mientras se inyectan las cabeceras estándar de conteo.

---

## 🚦 Criterios de Aceptación y Validación
1. `npx tsc --noEmit` en backend debe compilar con 0 errores.
2. `npx ng build` en frontend debe compilar con 0 errores.
3. Las pruebas de endpoints con archivos inválidos o parámetros inválidos deben responder con códigos HTTP precisos (400, 404, etc.) formateados consistentemente.
4. Las pruebas de migración de base de datos deben completar exitosamente sin pérdida de datos.
