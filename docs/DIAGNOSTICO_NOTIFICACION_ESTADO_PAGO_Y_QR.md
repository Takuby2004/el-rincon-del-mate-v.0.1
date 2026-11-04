# Diagnóstico Técnico: Notificación del Estado de Pago y Flujo QR

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v0.1)  
**Consulta del Usuario:** "Al rechazar o aceptar el pago o no como dueño, como cliente no me llega la notificación del estado del pedido a mi QR, ¿a qué se debe?"

---

## 1. Análisis de Escenarios Posibles

Dependiendo de cómo estés realizando la prueba, existen 3 razones técnicas principales:

### Escenario A: Estás esperando que la pantalla del cliente se actualice sola en vivo
* **Comportamiento actual:** Cuando el cliente sube el comprobante en `/checkout/pago`, el sistema lo redirige a la vista de confirmación: `/pedido/:orderNumber`.
* **La limitación:** La pantalla de confirmación ([`frontend/src/app/features/orders/order-detail.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/orders/order-detail.component.ts)) consulta el estado del pedido **una sola vez** al cargar la página (`ngOnInit`).
* **Consecuencia:** Si el administrador aprueba o rechaza el pedido en otra pestaña, la pantalla del cliente **no cambia automáticamente en tiempo real** (no hay recarga automática ni WebSockets).
* **Comprobación:** Si recargas la página del pedido con **F5**, verás que el estado cambia de inmediato a verde (*"Pagado y Verificado"*) o rojo (*"Pago Rechazado"* con el motivo).

### Escenario B: Te refieres al correo electrónico de notificación al cliente
* **Comportamiento programado:** Al aprobar o rechazar un pago, [`backend/src/services/payment.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/payment.service.ts) llama a `EmailService.sendPaymentStatusNotification(order, payment, status)`.
* **Factores a revisar:**
  1. **Dirección de correo ingresada:** La notificación se envía al correo que se escribió en el formulario de envío (`/checkout`). Si se usó un correo ficticio o de prueba que no existe, no llegará.
  2. **Carpeta de Spam / No deseado:** Los correos transaccionales enviados por SMTP a menudo van a la carpeta de Spam.
  3. **Credenciales SMTP en `.env`:** Si la contraseña de aplicación de Gmail (`SMTP_PASS`) tiene algún carácter erróneo o fue revocada por Google, el backend arrojará un error de autenticación SMTP.

### Escenario C: El código QR escaneado desde el teléfono
* Los códigos QR de los productos o del comprobante contienen un enlace web (`http://localhost:4200/pedido/:orderNumber`).
* Al escanearlo desde un celular, si el celular está en la misma red Wi-Fi pero intenta abrir `localhost`, el celular no puede conectarse porque `localhost` hace referencia al propio teléfono, no a tu computadora de desarrollo.

---

## 2. Mejoras Propuestas (Pendientes de Autorización)

1. **Auto-actualización (Polling) en la pantalla del pedido:**
   * Agregar una consulta periódica cada 5 o 10 segundos en `/pedido/:orderNumber` mientras el estado sea `PENDING_PAYMENT_VERIFICATION`.
   * En cuanto el dueño presione "Aprobar" en el panel, la pantalla del cliente cambiará a verde automáticamente sin tener que presionar F5.
2. **Botón de actualización manual:**
   * Agregar un botón visible *"Actualizar Estado"* en la pantalla del cliente.

