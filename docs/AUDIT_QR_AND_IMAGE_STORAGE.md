# Auditoría Técnica: Validación de Códigos QR y Almacenamiento de Imágenes

**Fecha:** 10 de Septiembre de 2026  
**Proyecto:** El Rincón del Mate (Backend v.0.1)  
**Objetivo:** Evaluar las capacidades actuales del backend respecto a:
1. Validación y procesamiento de información mediante códigos QR.
2. Mecanismos de almacenamiento de imágenes de productos en la Base de Datos.

---

## 1. Validación de Información por Códigos QR

### 🔍 Estado Actual en el Código
Al auditar los modelos ([schema.prisma](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/prisma/schema.prisma)), controladores y servicios:

- **Generación de QR (Productos):** El backend cuenta con una utilidad ([qrGenerator.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/utils/qrGenerator.ts)) que usa la librería `qrcode` para crear códigos QR con el enlace web al producto (`http://.../productos/{slug}`) y guardarlo como cadena DataURL Base64.
- **Configuración de QR de Pago:** Permite a los administradores subir una imagen estática de un QR bancario ([paymentQr.service.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/paymentQr.service.ts)) para que los clientes lo escaneen desde su app bancaria.
- **Comprobantes de Pago:** El cliente sube una imagen de comprobante (`PaymentProof`) al crear una orden.
- **Proceso de Validación:** La validación de pagos **NO es automática por lectura/escaneo de QR ni por integración bancaria**. Se realiza de forma **manual** por un usuario administrador mediante los métodos `PaymentService.approvePayment()` y `PaymentService.rejectPayment()`.

### ❌ ¿El backend valida datos decodificando QR?
**No de forma automática.** El backend no tiene implementado un lector de QR (como `jsQR`, `zxing` o visión artificial) para extraer datos de comprobantes ni valida payloads criptográficos de QR bancarios. El flujo actual es de **validación humana/administrativa**.

---

## 2. Almacenamiento de Imágenes de Productos

### 🔍 Estado Actual en el Código
Al auditar el modelo `Product` en Prisma y los servicios:

- **Tipo de dato en BD:** El campo `imageUrl` en el modelo `Product` está definido como `String?` (cadena de texto).
- **Qué se guarda en BD:** No se almacena el archivo binario (BLOB / Bytes) de la imagen en la base de datos PostgreSQL. Solo se almacena el enlace o ruta textual (por ejemplo `https://ejemplo.com/imagen.jpg` o `/uploads/products/foto.webp`).
- **Subida de imágenes en Productos:** En los endpoints de productos ([product.routes.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/routes/product.routes.ts)), no hay middleware de carga de archivos (`multer`). El controlador recibe un enlace de texto `imageUrl` en el cuerpo JSON de la petición.
- **Comparativa con otros módulos:** Para comprobantes de pago y QR bancario sí existe el servicio [fileStorageService.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/utils/fileStorageService.ts), el cual guarda los archivos en el disco local (`/uploads/...`) y guarda únicamente la URL resultante en la base de datos.

### ❌ ¿El backend almacena las imágenes en la Base de Datos?
**No directamente como archivos binarios (BLOBs).** Almacena únicamente la **referencia (URL / ruta en texto)**. Es el patrón estándar recomendado en la industria (guardar archivos en disco o almacenamiento en la nube y referenciarlos por URL en la base de datos).

---

## 3. Glosario Técnico Simplificado (Nivel Junior)

1. **Base64 / DataURL:** Una forma de convertir un archivo o imagen en una cadena larga de texto para poder enviarla o mostrarla directamente sin un archivo separado.
2. **BLOB (Binary Large Object):** Tipo de dato en bases de datos que permite guardar archivos enteros (como fotos o PDFs) directamente dentro de la tabla en lugar de una ruta. Rara vez se usa hoy en día porque hace la base de datos muy pesada y lenta.
3. **Multer:** Una herramienta (middleware) en NodeJS/Express que permite recibir archivos subidos desde un formulario (multipart/form-data) en el backend.
4. **URL de Referencia:** Guardar la dirección ("dónde está la foto") en la base de datos, en lugar de guardar la foto completa dentro de la base de datos.
5. **Decodificación / Lectura de QR:** El proceso inverso a generar un QR. Consiste en tomar una imagen de un QR y extraer el texto o datos que tiene ocultos en sus patrones.
