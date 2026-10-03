# 🌿 El Rincón del Mate v0.1

> **Plataforma E-Commerce Especializada en Mates Artesanales, Termos Térmicos y Bombillas Finas**  
> *Tradición, Calidad y Envío Garantizado a toda Bolivia*

---

## 📍 Información Comercial & Sucursales Oficiales

- **Sucursal Tarija**: Cel / WhatsApp: `+591 69891494` | TikTok: `+591 @rincon_delmate_tarija`
- **Sucursal La Paz**: Cel / WhatsApp: `+591 64014507` | Instagram: `@rincon_delmate_bolivia`
- **Cobertura de Envíos**: Despachos protegidos a Santa Cruz, La Paz, Cochabamba, Tarija, Oruro, Chuquisaca, Potosí, Beni y Pando.
- **Método de Pago Oficial**: Pago seguro mediante transferencia bancaria con escaneo de **Código QR del Dueño** y adjunción obligatoria de comprobante.

---

## 🛠️ Stack Tecnológico

### 🎨 Frontend
- **Framework**: Angular 19 (Arquitectura Standalone Components).
- **Estilos & Diseño**: Tailwind CSS con paleta artesanal personalizada (`wood`, `mate`, `gold`, `cream`, `darkness`).
- **Iconografía & Tipografía**: FontAwesome 6 + Google Font *Outfit*.
- **UI/UX & Animaciones**:
  - Directiva de resiliencia `[appImgFallback]` con arte vectorial SVG embebido sin dependencias externas.
  - **Skeleton Loaders** con efecto *Shimmer Wave* para evitar saltos de diseño (*Cumulative Layout Shift*).
  - Micro-animaciones escalonadas (*staggered*) y rebote interactivo en badge de carrito de compras.
  - Curvas de aceleración Bézier físicas (`cubic-bezier(0.16, 1, 0.3, 1)`) en elevación de tarjetas.
  - **Sistema de Modales Aislados & Validación Reactiva (Admin)**: Capa de profundidad `z-[100]` con bloqueo de interacción exterior, marcos con gradiente rojo (`linear-gradient`) y mensajes emergentes (*Pop Messages*) interactivos por campo.

### ⚙️ Backend
- **Entorno de Ejecución**: Node.js con TypeScript.
- **Framework Web**: Express.js.
- **Base de Datos & ORM**: PostgreSQL gestionado con Prisma ORM.
- **Seguridad & Autenticación**: JSON Web Tokens (JWT) + Hashing seguro con Bcrypt.js.
- **Gestión de Archivos**: Multer para almacenamiento seguro de imágenes (QR bancario y comprobantes de pago de clientes).
- **Servicios Auxiliares**:
  - Generación de códigos QR con la librería `qrcode`.
  - Generación de reportes y facturación/resumen de pedidos en PDF con `pdfkit`.

---

## 📋 Matriz de Casos de Uso del Negocio

| Código | Módulo | Descripción Funcional |
| :--- | :--- | :--- |
| **CU01** | Catálogo Público | Visualización de productos con precios en Bolivianos (Bs.), stock y categorías. |
| **CU02** | Filtrado & Búsqueda | Búsqueda reactiva por texto y filtrado por categoría de productos. |
| **CU03** | Detalle de Producto | Ficha técnica con descripción, selector de cantidad y badge de estado de stock. |
| **CU04** | Carrito de Compras | Gestión reactiva de ítems, cálculo automático de subtotales y total general. |
| **CU05** | QR por Producto | Generación de código QR único por cada producto para compartir en redes. |
| **CU06** | Checkout (Paso 1) | Formulario de datos del cliente (nombre, celular, ciudad y dirección). |
| **CU07** | Checkout (Paso 2) | Visualización del QR oficial del dueño y subida obligatoria del comprobante de pago. |
| **CU08** | Control de Stock | Reserva y decremento automático del inventario al momento de crear el pedido. |
| **CU09** | Reversión de Stock | Reincorporación automática de stock si el pago es rechazado o el pedido se cancela. |
| **CU10** | Verificación de Pagos | Panel administrativo para inspeccionar el comprobante adjunto y aprobar el pago. |
| **CU11** | Rechazo con Motivo | Rechazo de pagos no válidos con registro obligatorio de justificación. |
| **CU12** | Gestión de QR Dueño | Interfaz administrativa para subir y activar una nueva imagen de QR bancario. |
| **CU13** | CRUD de Catálogo | Gestión de productos, búsqueda reactiva, filtros multidimensionales (categoría, estado, stock, precio y costo), KPIs y control de stock. |
| **CU14** | Dashboard & Métricas | Estadísticas en tiempo real de ingresos totales, pedidos pagados y stock crítico. |
| **CU15** | Reportes Financieros | Reportes de ventas e inventario con cálculo de margen de ganancia. |
| **CU16** | Exportación PDF | Generación y descarga de la orden de pedido en formato PDF. |

---

## 🚀 Guía de Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v18 o superior.
- **PostgreSQL**: Instancia local o remota en ejecución.
- **NPM**: Administrador de paquetes incluido con Node.js.

---

### 1. Configuración del Backend

1. Entra a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea el archivo `.env` en la raíz de `backend/` con las siguientes variables:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/el_rincon_del_mate?schema=public"
   JWT_SECRET="el_rincon_del_mate_jwt_secret_2026_super_seguro"
   ```

4. Genera el cliente de Prisma y ejecuta las migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Ejecuta el semillado de datos (*seed* con usuario admin, categorías y productos iniciales):
   ```bash
   npx prisma db seed
   ```

6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *El servidor API estará disponible en `http://localhost:3000`*.

---

### 2. Configuración del Frontend

1. En una nueva terminal, entra a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación Angular:
   ```bash
   npm start
   ```
   *La tienda estará accesible en tu navegador en `http://localhost:4200`*.

---

## 🔑 Credenciales de Acceso (Demostración / Pruebas)

| Rol | Correo Electrónico | Contraseña | Acceso |
| :--- | :--- | :--- | :--- |
| **Dueño / Administrador** | `admin@elrincondelmate.com` | `admin123` | [http://localhost:4200/admin/login](http://localhost:4200/admin/login) |

---

## 📡 Endpoints de la API REST

### Autenticación
- `POST /api/auth/login`: Autenticación del administrador y entrega de token JWT.

### Catálogo & Categorías
- `GET /api/products`: Listado de productos (con soporte de búsqueda y filtros).
- `GET /api/products/:slug`: Detalle de producto por slug.
- `POST /api/products`: Creación de producto (requiere auth).
- `PUT /api/products/:id`: Actualización de producto y ajuste de stock (requiere auth).
- `DELETE /api/products/:id`: Desactivación de producto (requiere auth).
- `GET /api/categories`: Listado de categorías.
- `GET /api/categories/:slug`: Categoría con sus productos asociados.

### Pedidos & Pagos
- `POST /api/orders`: Creación de pedido con comprobante de pago multipart/form-data.
- `GET /api/orders`: Listado de pedidos con filtros por estado (requiere auth).
- `GET /api/orders/:id`: Detalle completo de pedido (requiere auth).
- `PATCH /api/orders/:id/status`: Actualización del estado de envío (requiere auth).
- `GET /api/orders/:id/pdf`: Descarga del comprobante de pedido en formato PDF.
- `PATCH /api/payments/:id/approve`: Aprobación de pago (requiere auth).
- `PATCH /api/payments/:id/reject`: Rechazo de pago con motivo y restauración de inventario (requiere auth).

### Configuración del QR Bancario
- `GET /api/payment-qr/active`: Obtiene el QR actualmente activo para el checkout público.
- `POST /api/payment-qr/upload`: Sube y activa una nueva imagen de QR del dueño (requiere auth).
- `PATCH /api/payment-qr/:id/deactivate`: Desactiva un QR configurado (requiere auth).

### Reportes & Estadísticas
- `GET /api/stats/dashboard`: Resumen de métricas para el dashboard de administración.
- `GET /api/reports/sales`: Reporte financiero de ventas y márgenes de ganancia.

---

## 🛡️ Estructura del Directorio

```text
el-rincon-del-mate-v.0.1/
├── backend/                    # Servidor Node.js + Express + Prisma
│   ├── prisma/                 # Esquema de base de datos y scripts de seed
│   ├── src/
│   │   ├── controllers/        # Controladores de la API REST
│   │   ├── middlewares/        # Middlewares (JWT Auth, Multer upload)
│   │   ├── routes/             # Definición de rutas Express
│   │   └── server.ts           # Punto de entrada del backend
│   └── uploads/                # Directorio de imágenes y comprobantes
│
├── frontend/                   # Cliente Angular 19.2 Standalone
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Servicios (API, Carrito, Auth) y Guards
│   │   │   ├── features/       # Vistas (Home, Catálogo, Checkout, Admin)
│   │   │   ├── layouts/        # Layout público y Layout del panel admin
│   │   │   └── shared/         # Directivas (ImgFallback) y Pipes (AssetUrl)
│   │   ├── assets/             # Logos y emblemas oficiales SVG
│   │   └── styles.css          # Animaciones clave, Shimmer y diseño global
│   └── tailwind.config.js      # Paleta artesanal y tokens de animación
│
├── docs/                       # Documentación técnica y planes de auditoría
│   ├── AUDIT_INVESTIGATION.md
│   ├── IMAGE_LOADING_AUDIT_PLAN.md
│   ├── SYSTEM_README_DOCUMENTATION_PLAN.md
│   ├── UI_ANIMATIONS_AND_IMAGE_FIX_PLAN.md
│   └── USE_CASE_TRACEABILITY.md
│
└── README.md                   # Documentación principal del sistema
```

---

## 👥 Desarrollado con Excelencia
**El Rincón del Mate** - *Comercialización Oficial de Mates Imperiales, Torpedos, Bombillas de Alpaca y Termos Térmicos en Tarija, La Paz y toda Bolivia.*
