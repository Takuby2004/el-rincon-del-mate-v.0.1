# 📋 Plan de Implementación: Reestructuración de Campos de Datos del Cliente en Checkout
**Proyecto:** El Rincón del Mate  
**Fecha:** Septiembre 2026  
**Documento:** `/docs/PLAN_FORMULARIO_CHECKOUT_DATOS_CLIENTE.md`

---

## 🎯 1. Objetivos del Cambio

1. **Separación de Nombres y Apellidos:**
   * Crear campos independientes para **Nombre(s)**, **Apellido Paterno** y **Apellido Materno**.
   * Concatenar de forma transparente para almacenamiento consistente en backend (`clientName`).

2. **Entrada Numérica Estricta:**
   * Restringir los campos **Teléfono / WhatsApp** y **CI / NIT** para que acepten **únicamente dígitos numéricos (0-9)**.
   * Añadir `inputmode="numeric"` para desplegar teclado numérico nativo en smartphones.

3. **Selector Desplegable de Departamentos de Bolivia:**
   * Agregar un campo `<select>` junto a la **Ciudad** con los **9 Departamentos de Bolivia**:
     * Beni
     * Chuquisaca
     * Cochabamba
     * La Paz
     * Oruro
     * Pando
     * Potosí
     * Santa Cruz (por defecto)
     * Tarija

---

## 🏗️ 2. Archivos Afectados

1. `frontend/src/app/features/checkout/checkout.component.ts`: Modelo reactivo y validaciones de datos del cliente.
2. `frontend/src/app/features/checkout/checkout.component.html`: Interfaz visual con grid responsivo, selectores y directivas de teclado numérico.
3. `frontend/src/app/features/checkout/checkout-payment.component.ts`: Manejo y envío del payload estructurado.

---

## 📖 3. Glosario Técnico (Para Desarrolladores Junior)

* **`inputmode="numeric"`:** Es un atributo de HTML5 que le indica al navegador de un teléfono móvil que abra directamente el teclado con números en lugar del teclado alfanumérico completo, mejorando la experiencia del usuario (*UX*).
* **Controlador de Entrada Numérica:** Una función en TypeScript que escucha el evento de escritura (`input` / `keydown`) y elimina automáticamente cualquier letra o símbolo que no sea un número.
* **Componente Desplegable (`<select>`):** Es un elemento de formulario que ofrece una lista cerrada de opciones predeterminadas para evitar que el usuario cometa errores tipográficos al ingresar datos estándar (como departamentos o países).
