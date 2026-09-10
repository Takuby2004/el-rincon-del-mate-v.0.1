# Matriz de Trazabilidad de Casos de Uso (USE_CASE_TRACEABILITY.md)

**Proyecto:** El Rincón del Mate v0.1  
**Fecha:** 2026-09-07  
**Estado:** Definitivo y Actualizado  

---

## 1. Resumen de Casos de Uso Definitivos

> [!IMPORTANT]
> **El caso de uso "Gestionar Catálogos" ha sido ELIMINADO COMPLETAMENTE.** No existen servicios, tablas, endpoints ni vistas para catálogos. La experiencia del cliente es directa a través de Productos, Categorías y Búsqueda.

| ID | Caso de Uso | Descripción General | Actor Principal |
| :--- | :--- | :--- | :--- |
| **CU01** | Autenticar Usuario | Registro, Inicio de Sesión (JWT), cierre de sesión y gestión de credenciales. | Cliente / Administrador |
| **CU02** | Gestionar Perfil | Actualización de información personal, dirección de envío y contraseña. | Cliente / Administrador |
| **CU03** | Gestionar Clientes | Consulta, registro, edición y suspensión de clientes en el sistema. | Administrador |
| **CU04** | Gestionar Categorías | Crear, listar, editar y eliminar categorías de productos (Mates, Termos, Bombillas, Accesorios). | Administrador |
| **CU05** | Gestionar Productos | CRUD de productos, stock, precios, costos, imágenes y generación de código QR por producto. | Administrador |
| **CU06** | Gestionar Pedidos | Registro de pedido por cliente y gestión de estados de entrega por administrador. | Cliente / Administrador |
| **CU07** | Realizar Pago | Consulta del QR activo del dueño, envío obligatorio de comprobante, verificación y aprobación/rechazo por el dueño. | Cliente / Administrador |
| **CU08** | Calcular Estadísticas | Cálculo de ingresos netos (solo pagos `APPROVED`), costos, ganancias y pronóstico de demanda. | Administrador |
| **CU09** | Gestionar Reportes | Exportación y descarga de reportes detallados de ventas e inventario en formato PDF. | Administrador |

---

## 2. Detalle del Caso de Uso CU07: Realizar Pago

### Sub-flujos y Acciones Específicas:
1. **Mostrar QR del Dueño**: El cliente en `/checkout/pago` consulta el código QR bancario activo configurado por el dueño.
2. **Subir Comprobante de Pago**: El cliente adjunta una imagen (PNG, JPG, WEBP <= 5MB) de la transferencia efectuada desde su app bancaria.
3. **Registrar Comprobante**: El backend almacena la imagen y genera la entidad `PaymentProof`.
4. **Enviar Comprobante junto al Pedido**: El pedido se crea atómicamente con estado inicial de pago `PENDING_VERIFICATION` y reserva de stock.
5. **Revisar Comprobante**: En `/admin/pedidos/:id`, el dueño visualiza la imagen del comprobante enviado.
6. **Aprobar Pago**: Al confirmar aprobación, `Payment.status = APPROVED`, `Order.status = PAID`, y se contabiliza en ventas.
7. **Rechazar Pago**: Al rechazar, se registra `rejectionReason`, `Payment.status = REJECTED`, `Order.status = PAYMENT_REJECTED` y se restaura el stock automáticamente en `InventoryMovement`.

---

## 3. Matriz de Cobertura Tecnológica

| ID | Componente Backend (Express + Prisma) | Componente Frontend (Angular Standalone) | Modelo de Datos (PostgreSQL) |
| :--- | :--- | :--- | :--- |
| **CU01** | `AuthController`, `JwtMiddleware` | `AuthFeature`, `AuthService`, `AuthGuard` | `User` |
| **CU02** | `ProfileController`, `UserService` | `ProfileFeature`, `UserService` | `User`, `Client` |
| **CU03** | `ClientController`, `ClientService` | `ClientsFeature`, `ClientService` | `Client` |
| **CU04** | `CategoryController`, `CategoryService` | `CategoriesFeature`, `CategoryService` | `Category` |
| **CU05** | `ProductController`, `ProductService` | `ProductsFeature`, `ProductService` | `Product`, `InventoryMovement` |
| **CU06** | `OrderController`, `OrderService` | `OrdersFeature`, `CartFeature`, `OrderService` | `Order`, `OrderItem` |
| **CU07** | `PaymentController`, `PaymentQrController` | `CheckoutFeature`, `PaymentQrFeature`, `PaymentService` | `Payment`, `PaymentProof`, `PaymentQrConfig` |
| **CU08** | `StatisticsController`, `StatsService` | `StatisticsFeature`, `StatsService` | `Order`, `Payment`, `OrderItem` |
| **CU09** | `ReportController`, `PdfReportService` | `ReportsFeature`, `ReportService` | `Order`, `Product`, `Payment` |
