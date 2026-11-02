# Auditoría Técnica: Modelo de Usuarios y Estructura de la Base de Datos

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**ORM / Base de Datos:** Prisma ORM / PostgreSQL (Supabase)  

---

## 1. Respuesta Directa a la Pregunta

> **¿Existe la tabla usuarios en la base de datos?**  
> **Sí, existe**, pero en la base de datos se llama **`User`** (en singular y en inglés), que es la convención estándar en Prisma ORM.

Además, al estar integrados con Supabase, la información de los usuarios se divide de forma limpia en **dos lugares complementarios**:

1. **Tabla `User` (en el esquema `public` de PostgreSQL):**  
   Gestionada por tu backend mediante Prisma. Guarda la identidad comercial del usuario dentro de la tienda:
   - `id`: Identificador único (UUID).
   - `name`: Nombre y apellido.
   - `email`: Correo electrónico (único).
   - `role`: Rol del usuario (`ADMIN` para el dueño, `CLIENT` para compradores).
   - `phone`: Teléfono de contacto.
   - `createdAt` / `updatedAt`: Fechas de registro y última actualización.
   - `clientProfile`: Relación 1 a 1 con la tabla **`Client`** (dirección de envío, CI/NIT y ciudad).

2. **Tabla `auth.users` (en el esquema interno de Supabase Auth):**  
   Gestionada por la infraestructura de seguridad de Supabase. Guarda las credenciales cifradas, tokens de acceso y estados de confirmación de correo.

---

## 2. Mapa Completo de Tablas del Sistema (Prisma ORM)

| # | Modelo en Código | Tabla en PostgreSQL | Propósito en el Negocio |
| :-: | :--- | :--- | :--- |
| 1 | **`User`** | `User` | **Usuarios y accesos** (administradores y clientes registrados). |
| 2 | **`Client`** | `Client` | Perfil extendido del comprador (CI/NIT, dirección de entrega, ciudad). |
| 3 | **`Category`** | `Category` | Categorías del catálogo (Mates, Termos, Bombillas). |
| 4 | **`Product`** | `Product` | Catálogo de productos, precios, costos, stock y fotos. |
| 5 | **`Order`** | `Order` | Pedidos realizados por los clientes. |
| 6 | **`OrderItem`** | `OrderItem` | Ítems y cantidades dentro de cada pedido. |
| 7 | **`Payment`** | `Payment` | Registro y estado financiero del pago de cada pedido. |
| 8 | **`PaymentProof`** | `PaymentProof` | Foto del comprobante de transferencia bancaria del cliente. |
| 9 | **`PaymentQrConfig`** | `PaymentQrConfig` | Imagen del código QR bancario del dueño de la tienda. |
| 10 | **`InventoryMovement`** | `InventoryMovement` | Auditoría de entradas/salidas de stock (compras, ventas, ajustes). |

---

## 3. Glosario Técnico (Nivel Junior) 📚

* **Esquema `public`:** La sección principal de la base de datos donde residen las tablas creadas para la lógica de la tienda (productos, pedidos, etc.).
* **Esquema `auth`:** Un compartimento aislado y protegido dentro de PostgreSQL donde Supabase guarda los usuarios y contraseñas para que no se mezclen con el resto de tablas.
* **Prisma Model:** La definición en código TypeScript/Prisma de una tabla de base de datos. Por convención estándar, los modelos en Prisma se nombran en inglés y en singular (`User`, `Product`, `Order`).
* **UUID (Universally Unique Identifier):** Un código largo alfanumérico único en el mundo (ej: `123e4567-e89b-12d3-a456-426614174000`) usado como identificador (`id`) para evitar colisiones de datos.

