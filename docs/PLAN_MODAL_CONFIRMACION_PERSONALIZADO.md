# Plan de Implementación: Modal de Confirmación y Alertas Personalizado

## 1. Contexto y Objetivos
Reemplazar los diálogos nativos del navegador (`window.confirm()` y `window.alert()`) en los módulos de administración y operaciones (desactivación/eliminación de productos, eliminación de categorías, clientes, gestión de pagos y QRs) por una ventana emergente (*modal*) personalizada, fluida y con diseño estético *premium* que combine con la identidad visual del proyecto ("El Rincón del Mate").

---

## 2. Glosario de Términos (Para Desarrolladores Junior)

* **Modal / Pop-up:** Ventana superpuesta en primer plano que interrumpe el flujo normal para que el usuario tome una decisión crítica.
* **Backdrop Blur:** Técnica de diseño moderno que desenfoca visualmente el fondo para dar sensación de profundidad y elegancia (*glassmorphism*).
* **DialogService (Servicio de Diálogo):** Clase singleton en Angular que orquesta la apertura, parámetros y resolución de la promesa de respuesta (Aceptar / Cancelar) desde cualquier parte del código.
* **Signal / BehaviorSubject:** Mecanismo reactivo para emitir y escuchar el estado del modal (abierto, cerrado, opciones de configuración) sin acoplar fuertemente los componentes.
* **Promise / Asincronismo (`await`):** Permite escribir código limpio que espera la respuesta del usuario de forma no bloqueante: `if (await dialogService.confirm(...)) { ... }`.

---

## 3. Arquitectura del Componente

### 3.1. Servicio de Diálogo (`DialogService`)
- Ubicación: `frontend/src/app/core/services/dialog.service.ts`
- Métodos principales:
  - `confirm(options: DialogOptions): Promise<boolean>`
  - `alert(options: AlertOptions): Promise<void>`
- Tipos de diálogo soportados:
  - `'danger'` (Rojo / Advertencia crítica, ej: eliminar productos/categorías/clientes)
  - `'warning'` (Ámbar / Precaución)
  - `'info'` (Mate / Informativo)
  - `'success'` (Esmeralda / Éxito)

### 3.2. Componente Visual (`ConfirmModalComponent`)
- Ubicación: `frontend/src/app/shared/components/confirm-modal/confirm-modal.component.ts`
- Características estéticas:
  - Telón de fondo oscuro con `backdrop-blur-md` y animación de fundido `animate-fade-in`.
  - Tarjeta modal con animación de entrada escala (`scale-in` / `slide-up`), bordes redondeados `rounded-3xl` y sombras de alta fidelidad.
  - Ícono decorativo temático con badges iluminadas.
  - Título claro y mensaje descriptivo en tipografía Outfit.
  - Botones de acción con micro-animaciones en *hover* y foco accesible.

### 3.3. Punto de Montaje Global
- Integrado en `app.component.html` para estar disponible globalmente sin necesidad de duplicar HTML en cada vista.

---

## 4. Archivos a Modificar / Crear

1. **Nuevo:** `frontend/src/app/core/services/dialog.service.ts`
2. **Nuevo:** `frontend/src/app/shared/components/confirm-modal/confirm-modal.component.ts`
3. **Nuevo:** `frontend/src/app/shared/components/confirm-modal/confirm-modal.component.html`
4. **Modificación:** `frontend/src/app/app.component.ts` y `app.component.html`
5. **Modificación:** `frontend/src/app/features/admin-products/admin-products.component.ts`
6. **Modificación:** `frontend/src/app/features/admin-categories/admin-categories.component.ts`
7. **Modificación:** `frontend/src/app/features/admin-clients/admin-clients.component.ts`
8. **Modificación:** `frontend/src/app/features/payment-qr-config/payment-qr-config.component.ts`
9. **Modificación:** `frontend/src/app/features/admin-orders/admin-orders.component.ts`
10. **Actualización:** `README.md`

---

## 5. Verificación y Pruebas
- Verificar que al hacer clic en "Eliminar categoría" o "Desactivar producto" se abra el modal emergente con su estilo adecuado.
- Comprobar que al pulsar "Cancelar" o presionar la tecla Esc / clic fuera no se ejecute la acción.
- Comprobar que al pulsar "Eliminar" se ejecute la llamada HTTP correctamente y se refresque la lista.
