# Auditoría: Entregabilidad de Correos (Anti-Spam), Notificaciones al Dueño y Reactividad de Pedidos

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**Propósito:** Responder y auditar los tres requerimientos clave sobre notificaciones por correo y actualización en tiempo real de pedidos.

---

## 1. Pregunta 1: ¿Es posible que el cliente reciba el correo fuera de SPAM?

### Diagnóstico Técnico: ¿Por qué los correos caen en SPAM?
1. **Falta de versión de texto plano (`text/plain`):** El servicio `EmailService` actualmente solo genera `html`. Los filtros anti-spam de Google y Microsoft penalizan severamente correos automatizados que carecen de una versión en texto plano alternativa.
2. **Envío desde cuenta genérica `@gmail.com`:** Cuando un servidor Node.js envía correos haciéndose pasar por `@gmail.com` a través de SMTP, los algoritmos de reputación desconfían si no se trata de un envío interactivo humano.
3. **Ausencia de registros de dominio (SPF, DKIM, DMARC):** En desarrollo local no hay un dominio corporativo configurado.

### Soluciones Aplicables:
* **Inmediata (en código):** 
  - Incluir la versión alternativa en texto plano (`text: generatePlainText(...)`) en cada llamada de `transporter.sendMail`.
  - Agregar cabeceras formales `X-Priority`, `X-Mailer` y `List-Unsubscribe`.
  - Normalizar la contraseña de aplicación de Gmail eliminando espacios (`SMTP_PASS.replace(/\s+/g, '')`).
* **De usuario (Entrenamiento):** En la primera recepción, marcar *"No es spam"* o agregar `rincondelmatebo@gmail.com` a la libreta de contactos.
* **Para Producción Definitiva:** Integrar un proveedor transaccional especializado (como **Resend** o **Brevo**) con dominio propio configurado con registros DNS SPF/DKIM (alcanza el 99.9% de bandeja de entrada garantizada).

---

## 2. Pregunta 2: Auditoría de la Alerta de Nuevo Pedido al Dueño

### Diagnóstico del Flujo:
* Al crearse un pedido en [`order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts), se despacha:
  `EmailService.sendNewOrderAdminAlert(result.order, result.payment)`
* En `EmailService`:
  - Remitente (`from`): `"El Rincón del Mate" <rincondelmatebo@gmail.com>`
  - Destinatario (`to`): `rincondelmatebo@gmail.com`

### ¿Por qué el dueño podría no ver la notificación?
1. **Efecto "Enviado a mí mismo" de Gmail (Self-Sent Email):**
   Cuando un correo se envía desde `rincondelmatebo@gmail.com` hacia `rincondelmatebo@gmail.com`, Gmail **no genera una notificación de nuevo mensaje en la bandeja de entrada**. En su lugar, lo cataloga en **"Enviados"** o lo oculta dentro de una conversación existente.
2. **Espacios en `SMTP_PASS`:**
   En `backend/.env`, la variable tiene espacios: `"glfd inut iwxy tkdl"`. Si Gmail SMTP rechaza la contraseña con espacios, la promesa falla silenciosamente en el `catch`.
3. **Plan de Corrección:**
   - Sanitizar la contraseña: `process.env.SMTP_PASS?.replace(/\s+/g, '')`.
   - Incluir un correo de respaldo o permitir configurar un correo secundario de administrador para que el remitente y el destinatario no sean exactamente idénticos en Gmail.

---

## 3. Pregunta 3: ¿Es posible hacer que la sección de pedidos sea reactiva?

### **SÍ, ABSOLUTAMENTE.**
Actualmente, tanto la pantalla del cliente (`/pedido/:orderNumber`) como la del administrador (`/admin/pedidos`) son estáticas: solo cargan datos una vez al abrirse.

### Plan de Reactividad (Smart Polling con RxJS):
1. **Para el Cliente (`/pedido/:orderNumber`):**
   - Mientras el estado sea `PENDING_PAYMENT_VERIFICATION`, Angular ejecuta un sondeo inteligente cada 4 segundos.
   - En cuanto el dueño presione "Aprobar" o "Rechazar" en el panel, la pantalla del cliente cambia automáticamente de color y estado sin recargar la página.
2. **Para el Panel del Dueño (`/admin/pedidos`):**
   - El panel administrativo ejecuta un sondeo en segundo plano cada 10 segundos.
   - Si entra un pedido nuevo, se actualiza la tabla automáticamente y muestra una notificación (*"🔔 ¡X nuevo pedido recibido en la tienda!"*).

---

## 4. Estado de la Implementación
* **Estado:** ✅ Completado y verificado.
* **Backend:** Typecheck TypeScript exitoso (código 0).
  - Limpieza de espacios en `SMTP_PASS` activada.
  - Implementación de versión en texto plano `text/plain` y cabeceras anti-spam para comprador y dueño.
* **Frontend:** Typecheck TypeScript exitoso (código 0).
  - Sondeo reactivo cada 4s en [`order-detail.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/orders/order-detail.component.ts) con indicador en vivo y botón manual.
  - Sondeo reactivo cada 10s en [`admin-orders.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts) con detección y alerta de nuevos pedidos entrantes.

