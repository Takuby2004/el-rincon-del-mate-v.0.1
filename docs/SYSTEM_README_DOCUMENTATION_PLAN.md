# Plan de Documentación: Creación del README.md Principal del Proyecto

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Ubicación de Destino**: `/README.md` (Raíz del proyecto)

---

## 1. Objetivo del README.md
Centralizar y estructurar toda la información técnica, de arquitectura, casos de uso, credenciales de prueba, instrucciones de instalación y comandos operativos para que cualquier desarrollador (junior o senior) o stakeholder pueda poner en marcha el sistema rápidamente.

---

## 2. Estructura y Secciones del README.md

1. **Encabezado y Emblema Oficial**: Nombre de la marca, sucursales oficiales (Tarija & La Paz, Bolivia), enlaces a redes y descripción general.
2. **Stack Tecnológico**:
   - **Frontend**: Angular 17 Standalone, Tailwind CSS con paleta personalizada (`wood`, `mate`, `gold`), RxJS, Directivas SVG Fallback y Skeleton Loaders.
   - **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, Multer, PDFKit y QRCode.
3. **Casos de Uso Implementados (Trazabilidad Total)**:
   - `CU01` al `CU16` (Navegación, catálogo, QR de producto, checkout en 2 pasos con comprobante obligatorio, verificación y rechazo de pagos con restauración de stock, subida de QR por el dueño, panel administrativo, dashboard, métricas, reportes y descarga de PDF).
4. **Instalación y Puesta en Marcha (Paso a Paso)**:
   - Configuración de variables de entorno (`.env`).
   - Migraciones y carga inicial de datos (`prisma migrate` / `prisma db seed`).
   - Inicio del servidor backend (`npm run dev` en puerto 3000).
   - Inicio del cliente frontend (`npm start` en puerto 4200).
5. **Credenciales y Cuentas de Demostración**:
   - Administrador / Dueño: `admin@elrincondelmate.com` / `admin123`.
6. **Mapeo de Rutas y Endpoints**:
   - Rutas públicas y protegidas del Frontend.
   - API REST Endpoints (Auth, Products, Categories, Orders, Payments, Payment QR Config, Reports, Statistics).
7. **Políticas de Resiliencia de Imágenes y Animaciones**:
   - Directiva de fallback SVG integrado offline.
   - Skeletons con shimmer y animaciones escalonadas (*staggered*).
