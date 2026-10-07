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
  - **Sistema de Modales Aislados & Validación Reactiva (Admin)**: Capa de profundidad `z-[100]` con bloqueo de interacción exterior, marcos con gradiente rojo (`linear-gradient`) y mensajes emergentes (*Pop Messages*) interactivos por campo.
  - **Sistema Global de Diálogos & Modales de Confirmación (`DialogService`)**: Sustitución completa de las alertas y confirmaciones nativas del navegador (`window.confirm`/`window.alert`) por modales elegantes con efecto *glassmorphism/backdrop-blur*, variantes temáticas (`danger`, `warning`, `info`, `success`), animación fluida de escala y accesibilidad total (tecla ESC y clics de desenfoque).
  - **Sistema Reactivo de Notificaciones Flotantes (`ToastService` & `ToastContainerComponent`)**: Notificaciones efímeras no bloqueantes basadas en Angular Signals, con cuatro variantes semánticas (`success`, `error`, `warning`, `info`), barra de tiempo decreciente (*progress bar* animada), pausa al pasar el cursor (*hover pause*), accesibilidad ARIA (`role="status"`, `aria-live="polite"`) y autocierre automático.
  - **Paginación Reactiva Inteligente (`PaginationComponent`)**: Componente standalone reutilizable con límite de 5 elementos por página, navegación por botones y números, y renderizado condicional inteligente (solo se muestra cuando `totalItems > 5`) en Productos, Categorías, Pedidos y Clientes.
  - **Módulo Unificado de Dashboards Administrativos y Financieros**: Consolidación total de la analítica operativa, comercial y financiera en una sola sección unificada (**Dashboards**). Incorpora:
    - **Gráficas de Barras Comparativas**: Visualización proporcional del desglose de capital (Ingresos Brutos vs Costo de Mercadería vs Ganancia Neta Líquida).
    - **Selector de Períodos de Tiempo Dinámico**: Botones interactivos tipo "pill" en la cabecera del histograma que permiten al administrador alternar entre **7 Días**, **14 Días** y **30 Días** de análisis, recalculando en tiempo real la facturación y la frecuencia de ventas.
    - **Histogramas de Frecuencia**:
      - *Histograma Temporal*: Volumen y facturación diaria con tooltips interactivos y etiquetas de días adaptativas.
      - *Histograma de Ticket Promedio*: Agrupación de compradores por intervalos de monto de pedido (`0-150 Bs`, `151-300 Bs`, `301-600 Bs`, `600+ Bs`).
    - **Ranking de Rendimiento**: Barras horizontales proporcionales del Top 5 productos más vendidos.
    - **Algoritmo Predictivo de Demanda (CU08)**: Cálculo automático de rotación diaria y proyección mensual sugerida para compras a proveedores.
  - **Módulo Especializado de Reportes Ejecutivos en PDF (`AdminReportsFeatureComponent`)**: Panel administrativo con previsualización en vivo en modal a pantalla completa (`<iframe>` sanitizado con `DomSanitizer`), selector de períodos temporales (`7 Días`, `30 Días`, `Todo el Histórico`), botón de apertura en pestaña completa, feedback interactivo con estados de carga independientes y notificaciones no bloqueantes `ToastService`:
    - **Reporte de Costos**: Auditoría del Costo de Bienes Vendidos (COGS), capital inmovilizado en bodega y desglose de costos por producto y categoría en formato horizontal (*Landscape*).
    - **Reporte de Ventas**: Consolidado de transacciones con pagos aprobados, volumen de ingresos en Bs., clientes atendidos y ticket promedio (AOV).
    - **Reporte de Ganancias**: Balance contable que deduce costos de los ingresos para calcular la utilidad neta en Bs., margen porcentual del negocio y ranking de rentabilidad.
    - **Reporte de Demandas**: Análisis predictivo de rotación de inventario, velocidad diaria de consumo (Run Rate), cálculo de días de cobertura y semáforo de reposición (Crítico, Alerta, Óptimo).
  - **Arquitectura y Estandarización de Modales Premium en el Panel**:
    - **Aislamiento de Stacking Context**: Todos los modales del sistema (Productos, Categorías, Clientes, Pedidos y Reportes) se declaran fuera de contenedores animados, solucionando el *containing block trap* de CSS para garantizar cobertura total de pantalla y superposición correcta sobre el sidebar (`z-[100]` y `z-[105]` para subdiálogos).
    - **Backdrop Estilizado & Accesibilidad**: Fondo cinematográfico translúcido (`bg-darkness-950/80 backdrop-blur-md`), soporte universal de cierre mediante tecla `Escape` (`@HostListener('window:keydown.escape')`) y clic exterior con detención de propagación en la tarjeta interior (`$event.stopPropagation()`).
    - **Ficha 360° de Clientes (Lectura)**: Modal informativo de perfil completo con CI/NIT, teléfono con enlace directo a WhatsApp Web, correo electrónico, dirección, ciudad y contador histórico de pedidos.
    - **Validaciones Reactivas y Badges de Error**: Retroalimentación visual interactiva en tiempo real en formularios modales sin desfasar el diseño visual.
  - **Transiciones y Animaciones del Panel**: Animación de entrada suave (`animate-fade-in`) y efectos de alto impacto escalonado (`animate-dashboard-pop` y `hover-lift`) con micro-transiciones fluidas en barras e histogramas.

### ⚙️ Backend
- **Entorno de Ejecución**: Node.js con TypeScript.
- **Framework Web**: Express.js.
- **Base de Datos & ORM**: PostgreSQL gestionado con Prisma ORM.
- **Seguridad & Autenticación**: JSON Web Tokens (JWT) + Hashing seguro con Bcrypt.js.
- **Gestión de Archivos**: Multer para almacenamiento seguro de imágenes (QR bancario y comprobantes de pago de clientes).
- **Servicios Auxiliares**:
  - Generación de códigos QR con la librería `qrcode`.
  - Generación de 4 reportes ejecutivos oficiales en PDF (Costos, Ventas, Ganancias, Demandas) y comprobantes de pedido con `pdfkit`.

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
| **CU10** | Verificación de Pagos & Pedidos | Panel administrativo con 3 estados simplificados (**Pendiente de verificación**, **Aprobado**, **Rechazado**), métricas rápidas (KPIs), normalización numérica integral de decimales (`Decimal` a `Number`) en backend y frontend, formateo seguro tolerante a fallos mediante el pipe `| number:'1.2-2'`, barra de búsqueda reactiva por cliente/número/teléfono, filtros por estado, botón de limpieza rápida, modal avanzado de inspección de comprobantes (zoom, rotación, descarga) y sincronización automática de stock. |
| **CU10.1** | Eliminación de Pedidos | Eliminación permanente de pedidos desde la tabla o el modal de detalle con confirmación visual de seguridad, restauración automática e inteligente de stock reservado y eliminación física de comprobantes. |
| **CU11** | Rechazo con Motivo | Rechazo de pagos no válidos con registro obligatorio de justificación. |
| **CU12** | Gestión de QR Dueño | Interfaz administrativa para subir y activar una nueva imagen de QR bancario. |
| **CU13** | CRUD de Catálogo | Gestión de productos (creación, edición y eliminación permanente con protección de integridad referencial de pedidos), búsqueda reactiva, filtros multidimensionales (categoría, estado, stock, precio y costo), KPIs y control de stock. |
| **CU13.1** | Gestión de Categorías | Directorio y administración de categorías con subida de imágenes, búsqueda reactiva por nombre/slug/descripción y paginación inteligente. |
| **CU14** | Dashboards & Analítica Visual | Tablero unificado con KPI de pedidos, salud financiera, gráficas de barras comparativas, histogramas de frecuencia y pronóstico predictivo de demanda. |
| **CU15** | Reportes Financieros Especializados | Generación y exportación de 4 tipos de reportes ejecutivos oficiales en PDF (Costos, Ventas, Ganancias, Demandas) con filtros por período (7 días, 30 días, histórico). |
| **CU16** | Exportación PDF de Pedido | Generación y descarga individual del comprobante de pedido en formato PDF. |

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

3. Copia el archivo `.env.example` a `.env` en la raíz de `backend/` y configura tus variables:
   ```bash
   cp .env.example .env
   ```
   *Genera un `JWT_SECRET` seguro de al menos 32 caracteres con:*
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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
- `DELETE /api/orders/:id`: Eliminación física de pedido con reposición automática de stock (requiere auth).
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
│   ├── prisma/                 # Esquema de base de datos (con Decimal 12,2) y seeders
│   ├── src/
│   │   ├── config/             # Configuración de entorno (env.ts), Multer y Prisma
│   │   ├── controllers/        # Controladores con delegación de errores next(err)
│   │   ├── errors/             # Clase AppError y manejo operacional de excepciones
│   │   ├── middlewares/        # Middlewares (JWT, Zod validate, Centralized errorHandler)
│   │   ├── routes/             # Rutas Express tipadas
│   │   ├── services/           # Lógica contable con Decimales, máquinas de estado y emails
│   │   ├── utils/              # Paginación estandarizada, validación Magic Bytes, QR y PDF
│   │   ├── validators/         # Esquemas Zod para todas las peticiones
│   │   └── server.ts           # Punto de entrada del backend
│   └── uploads/                # Directorio de imágenes y comprobantes
│
├── frontend/                   # Cliente Angular 19.2 Standalone
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Servicios (API, Carrito, Auth) y Guards
│   │   │   ├── features/       # Vistas (Home, Catálogo, Checkout, Admin Dashboards)
│   │   │   ├── layouts/        # Layout público y Layout del panel admin (Dashboards unificado)
│   │   │   └── shared/         # Directivas (ImgFallback) y Pipes (AssetUrl)
│   │   ├── assets/             # Logos y emblemas oficiales SVG
│   │   └── styles.css          # Animaciones clave, Shimmer y diseño global
│   └── tailwind.config.js      # Paleta artesanal y tokens de animación
│
├── docs/                       # Documentación técnica, planes y auditorías
│   ├── UIX/                    # Capturas PNG de todas las pantallas e interfaces (Desktop & Mobile)
│   ├── PLAN_CAPTURAS_UIX.md    # Inventario y documentación de capturas UI/UX
│   ├── AUDITORIA_INTEGRAL_SISTEMA_V0.1.md
│   ├── PLAN_UNIFICACION_DASHBOARD_Y_ESTADISTICAS.md
│   ├── PLAN_DIAGNOSTICO_Y_EVALUACION_V0.2.md
│   ├── PLAN_FASE_2_VALIDACION_ZOD_Y_ESTADOS.md
│   ├── PLAN_FASE_3_FINANZAS_MAGIC_BYTES_Y_PAGINACION.md
│   ├── PLAN_FASE_4_FRONTEND_PAGINACION_Y_TOASTS.md
│   └── USE_CASE_TRACEABILITY.md
│
└── README.md                   # Documentación principal del sistema
```

---

## 🚦 Máquina de Estados y Transición de Pedidos

El ciclo de vida de los pedidos implementa validación estricta de transiciones permitidas y control de stock bidireccional y atómico:

| Estado Actual | Transiciones Permitidas | Impacto en Inventario |
| :--- | :--- | :--- |
| `PENDING_PAYMENT_VERIFICATION` | `PAID`, `PAYMENT_REJECTED`, `CANCELLED` | Reserva stock al crearse |
| `PAID` | `PACKING`, `CANCELLED` | Mantiene stock reservado |
| `PACKING` | `SHIPPED`, `CANCELLED` | Mantiene stock reservado |
| `SHIPPED` | `DELIVERED`, `CANCELLED` | Mantiene stock reservado |
| `DELIVERED` | *(Estado final exitoso)* | Descuento definitivo |
| `PAYMENT_REJECTED` | `PAID`, `CANCELLED` | Restaura stock automáticamente; si se reactiva a `PAID`, re-reserva atómicamente |
| `CANCELLED` | *(Estado final terminal)* | Restaura stock si venía de un estado con stock activo |

---

## 👥 Desarrollado con Excelencia
**El Rincón del Mate** - *Comercialización Oficial de Mates Imperiales, Torpedos, Bombillas de Alpaca y Termos Térmicos en Tarija, La Paz y toda Bolivia.*
