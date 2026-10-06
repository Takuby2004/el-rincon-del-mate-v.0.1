# 🚀 PLAN DE DESARROLLO - FASE 4: EXPERIENCIA DE USUARIO, NOTIFICACIONES TOAST Y DASHBOARD DINÁMICO

**Proyecto:** El Rincón del Mate (v0.2)  
**Fecha:** Octubre 2026  
**Objetivo Principal:** Elevar la experiencia del usuario (UX) tanto para los clientes como para los administradores, eliminando alertas bloqueantes mediante un sistema reactivo y elegante de notificaciones flotantes (*Toasts*), dinamizando el panel de estadísticas con selector temporal interactivo (7, 14 y 30 días), y consolidando el consumo robusto de paginación y feedback en las operaciones críticas del negocio.

---

## 📋 Diagnóstico y Oportunidades Identificadas

1. **Notificaciones y Feedback Visual Fragmentado**:
   - Actualmente, varias pantallas administrativas utilizan mensajes temporales implementados ad-hoc (`notificationMessage` con `setTimeout` manual) o alertas nativas que bloquean el flujo de trabajo del usuario.
   - Es necesario un servicio centralizado, desacoplado y reactivo (`ToastService`) basado en Angular Signals, con un componente contenedor accesible (`ToastContainerComponent`) que ofrezca micro-animaciones fluidas y una estética artesanal en sintonía con la marca.

2. **Dashboard de Estadísticas Rígido**:
   - El endpoint `/api/admin/statistics` y el método `StatsService.getDashboardStats` calculaban de manera fija los últimos 7 días.
   - Los administradores necesitan comparar el rendimiento a distintos horizontes temporales (semana actual, quincena o mes completo) para tomar decisiones de abastecimiento y compras de yerba y accesorios.

3. **Integración con Paginación y Robustez de Controladores**:
   - Con la utilidad `paginate()` lista en el backend desde la Fase 3, los clientes frontend deben contar con soporte para enviar parámetros de paginación y beneficiarse de respuestas estructuradas sin romper vistas existentes.

---

## 🛠️ Plan de Implementación Paso a Paso

### Paso 1: Servicio Central de Notificaciones (`ToastService`)
- **Ubicación:** `frontend/src/app/core/services/toast.service.ts`
- **Características:**
  - Gestión de estado reactivo mediante `signal<ToastItem[]>`.
  - Soporte de 4 variantes semánticas:
    - `success` (Verde bosque artesanal con check)
    - `error` (Carmesí cálido con icono de error)
    - `warning` (Ámbar mate con icono de advertencia)
    - `info` (Azul pizarra con icono de información)
  - Duración configurable (default 4000ms) con temporizador individual y método de cierre manual (`dismiss(id)`).
  - Métodos amigables de conveniencia: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`.

### Paso 2: Componente Visual Flotante (`ToastContainerComponent`)
- **Ubicación:** `frontend/src/app/shared/components/toast-container/`
- **Características:**
  - Standalone component con directivas semánticas y accesibilidad (`role="status"`, `aria-live="polite"`).
  - Posicionamiento fixed superior/inferior derecho sin bloquear la navegación.
  - Micro-animaciones CSS suaves (slide-in, fade-out, scale) y barra de progreso de tiempo decreciente (*progress bar* animada).
  - Integración en la raíz de la aplicación (`frontend/src/app/app.component.html`).

### Paso 3: Selector de Períodos de Tiempo en Dashboard y Estadísticas
- **Backend:**
  - Actualizar `StatsService.getDashboardStats(days: number = 7)` para recibir el parámetro `days` (aceptando 7, 14, 30 días).
  - Actualizar `StatsController.getDashboardStats` para validar y transformar `req.query.days`.
- **Frontend:**
  - Actualizar `ApiService.getDashboardStats(days?: number)` en `api.service.ts`.
  - Añadir control interactivo de botones tipo "pill" en `dashboard.component.html` (7 Días | 14 Días | 30 Días).
  - Manejar reactivamente el estado de carga y redibujado de histogramas con escala adaptativa en `dashboard.component.ts`.

### Paso 4: Adopción y Reemplazo en Pantallas Administrativas Clave
- En `AdminOrdersFeatureComponent`:
  - Reemplazar las notificaciones locales por `toast.success()` y `toast.error()` en aprobación de comprobantes, rechazo con motivo, y envío de correos al comprador.
- En `AdminProductsFeatureComponent`:
  - Emitir toasts al crear, editar o dar de baja productos.
- En `PaymentQrConfigComponent`:
  - Emitir toasts al cargar y actualizar códigos QR de transferencia.

---

## 📖 Glosario de Conceptos Técnicos para Desarrolladores Junior

1. **Toast Notification (Notificación Toast):**
   - *Analogía:* Es como una pequeña nota adhesiva que un colega te pone discretamente en el borde de tu escritorio mientras trabajas. La ves, lees el mensaje de confirmación ("Pedido guardado"), y luego desaparece sola sin interrumpirte ni obligarte a presionar un botón de "Aceptar".
   - *Técnico:* Es un patrón de interfaz de usuario para mensajes de retroalimentación no bloqueantes y efímeros.

2. **Angular Signals (`signal`):**
   - *Analogía:* Piensa en un altavoz o una pizarra digital interactiva en una oficina. En cuanto alguien escribe un dato nuevo en la pizarra, todos los que están mirando esa pizarra se enteran al instante y actualizan lo que están haciendo sin tener que preguntar a cada minuto.
   - *Técnico:* Primitiva reactiva introducida en Angular moderno que almacena un valor y notifica de forma precisa y automática a las vistas y componentes que dependen de él cuando su valor cambia.

3. **Agregación Temporal Dinámica:**
   - *Analogía:* En lugar de tener un calendario impreso que solo te deja ver la semana actual, tienes una pantalla digital donde presionas "Últimos 14 días" o "Últimos 30 días" y el sistema reorganiza tus ventas diarias en tiempo real.
   - *Técnico:* Proceso en el backend donde se consultan registros de base de datos dentro de una ventana de tiempo flexible (`Date() - N días`) y se agrupan en cubos diarios (*buckets*) para graficar tendencias.

4. **Desacoplamiento (*Decoupling*):**
   - *Analogía:* Es como usar enchufes universales en lugar de soldar cada electrodoméstico directamente a los cables de la pared. Si quieres cambiar la lámpara, solo la desconectas sin romper la casa.
   - *Técnico:* Principio de diseño donde el servicio de mensajes (`ToastService`) no depende de ningún componente visual específico, permitiendo que cualquier botón o servicio dispare un mensaje desde cualquier rincón de la aplicación.

---

## 🛠️ Anexo: Normalización Numérica y Resiliencia en el Catálogo

- **Incidencia Detectada:** La serialización de campos `Decimal(12, 2)` de Prisma ORM hacia JSON emitía cadenas de texto (`string`). Al intentar invocar `.toFixed(2)` en la plantilla de administración sobre `product.price` y `product.cost` (este último protegido como `undefined`), se producía una excepción en runtime (`TypeError`) que interrumpía el ciclo de detección de cambios de Angular en la primera fila y dejaba en blanco las filas subsiguientes.
- **Acciones Ejecutadas:**
  1. *Backend (`product.service.ts`)*: Formateo explícito de `price` y `cost` a tipos numéricos `number` nativos antes de emitir la respuesta JSON de `getAll` y `getBySlug`.
  2. *Frontend (`admin-products.component.ts`)*: Mapeo defensivo de `price`, `cost` y `stock` con `Number(...) || 0`.
  3. *Plantilla (`admin-products.component.html` y vistas públicas)*: Sustitución de `.toFixed(2)` por el pipe declarativo nativo de Angular `| number:'1.2-2'`, permitiendo el despliegue íntegro de todos los productos en el catálogo y en el panel.
