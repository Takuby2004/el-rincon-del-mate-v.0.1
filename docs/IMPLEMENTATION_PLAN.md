# Plan de Implementación del Proyecto "El Rincón del Mate v0.1"

Este documento contiene la especificación y guía de implementación para el sistema e-commerce "El Rincón del Mate v0.1", respetando el stack tecnológico obligatorio (Angular + ExpressJS + Prisma + PostgreSQL) y los 9 casos de uso activos.

---

## 1. Explicación Técnica y Glosario para Desarrolladores Junior

### ¿Cómo funciona la arquitectura?
1. **Frontend (Angular)**: Interfaz de usuario construida con Componentes Standalone y estilizada con TailwindCSS. Maneja el estado, rutas y llamadas HTTP al servidor backend.
2. **Backend (ExpressJS)**: Servicio REST API desarrollado con TypeScript. Valida las peticiones, procesa comprobantes de pago, gestiona transacciones y aplica las reglas de negocio.
3. **Persistencia (Prisma + PostgreSQL)**: Base de datos relacional PostgreSQL administrada mediante Prisma ORM para garantizar la integridad referencial y transacciones atómicas.

### Glosario de Términos

- **Prisma ORM**: Mapeador objeto-relacional que traduce tipos de TypeScript a consultas relacionales SQL sin necesidad de escribir SQL nativo.
- **Transacción Atómica (`$transaction`)**: Conjunto de operaciones en base de datos que se ejecutan como una única unidad. Si alguna falla, se revierten todas los cambios (*rollback*).
- **Multipart Form-Data**: Protocolo de transferencia HTTP para enviar datos de formulario estructurados (JSON) junto con archivos binarios (imágenes JPG/PNG/WEBP).
- **PaymentProof (Comprobante de Pago)**: Evidencia fotográfica de la transferencia bancaria realizada por el cliente, asociada 1:1 con el registro de `Payment`.
- **PaymentQrConfig**: Registro de la configuración del código QR bancario subido por el dueño del negocio. Solo existe 1 QR activo simultáneamente.

---

## 2. Casos de Uso del Sistema

- **CU01**: Autenticar Usuario
- **CU02**: Gestionar Perfil
- **CU03**: Gestionar Clientes
- **CU04**: Gestionar Categorías
- **CU05**: Gestionar Productos
- **CU06**: Gestionar Pedidos
- **CU07**: Realizar Pago (QR del Dueño + Comprobante Obligatorio + Verificación Administrador)
- **CU08**: Calcular Estadísticas (Solamente pagos `APPROVED`)
- **CU09**: Gestionar Reportes (Exportación en PDF)

*Nota: El caso de uso "Gestionar Catálogos" ha sido totalmente removido.*

---

## 3. Estructura de Repositorios

- `/frontend`: Aplicación Angular Standalone.
- `/backend`: API REST en ExpressJS con Prisma ORM.
- `/docs`: Documentación del proyecto y matriz de trazabilidad.
