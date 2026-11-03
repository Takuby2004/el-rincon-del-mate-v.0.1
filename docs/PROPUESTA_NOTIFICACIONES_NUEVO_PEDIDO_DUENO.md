# Propuesta Técnica: Sistema de Notificaciones de Nuevos Pedidos para el Dueño (Email & WhatsApp)

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Evaluados:** [`order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts), [`email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts)  

---

## 1. Viabilidad Técnica

> **¿Es posible que al momento de que un cliente realice un pedido, el sistema notifique al dueño por correo electrónico o por WhatsApp?**  
> **Sí, es 100% posible para ambos canales.**

---

## 2. Análisis de Canales de Notificación

### Canal 1: Notificación por Correo Electrónico (Recomendada e Inmediata) 📧
* **Costo e Infraestructura:** Gratuito y sin servicios externos nuevos. Ya contamos con Nodemailer y el servidor SMTP de Gmail configurados.
* **Flujo de Trabajo:**
  1. El cliente completa el checkout y sube su comprobante de pago en [`order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts).
  2. En cuanto la orden se guarda en PostgreSQL, el backend invoca automáticamente `EmailService.sendNewOrderAlertToAdmin(...)`.
  3. El dueño recibe en su celular/computadora un correo con:
     - 🚨 **Asunto:** `[Nuevo Pedido] Orden #ORD-XXXXX - Bs. 320 - Cliente: Juan Pérez`
     - 👤 **Datos del Cliente:** Nombre, Celular con enlace a WhatsApp, Ciudad y Dirección.
     - 📦 **Detalle del Pedido:** Productos comprados, cantidades y total a cobrar.
     - 🔗 **Botón de Acción Rápida:** Enlace directo para abrir el panel de administración (`/admin/pedidos`) y revisar/aprobar el comprobante de pago.

---

### Canal 2: Notificación por WhatsApp 📲
Para que el **servidor backend** envíe un mensaje a WhatsApp de forma automática a tu celular, existen dos métodos:

#### Opción A: API Ligera de Alertas (CallMeBot / Twilio / Gateway Webhook)
* **Cómo funciona:**
  - El backend realiza una simple petición HTTP tipo:
    `GET https://api.callmebot.com/whatsapp.php?phone=+59169891494&text=Nuevo+pedido+ORD-123...&apikey=...`
  - Te llega un mensaje directo de WhatsApp a tu número personal en el instante en que entra la orden.
* **Ventajas:** Rápido de integrar para alertas personales del dueño.

#### Opción B: WhatsApp Webhook Directo al Finalizar Compra (Frontend)
* Al terminar el pedido, la pantalla de éxito le muestra al cliente un botón interactivo: *"Avisar al dueño por WhatsApp"* que abre una conversación pre-redactada con el dueño con los datos del pedido y el número de orden.

---

## 3. Plan de Implementación Recomendado

1. **Fase 1 (Inmediata y Robusta):** Notificación automática por **Correo Electrónico** al Administrador cada vez que entra un nuevo pedido.
2. **Fase 2 (Complementaria):** Habilitar el canal de **WhatsApp** según la opción preferida (alerta silenciosa al dueño mediante API o confirmación directa del cliente).

---

## 4. Glosario Técnico (Nivel Junior) 📚

* **Disparador de Evento (Trigger / Hook):** Un punto en el código que reacciona automáticamente cuando algo ocurre (por ejemplo, *"apenas se cree un pedido en la base de datos, dispara la notificación"*).
* **Alerta en Tiempo Real:** Aviso que se envía en una fracción de segundo para que el dueño sepa que alguien compró sin tener que estar refrescando el panel a cada rato.
* **Botón de Acción (Call to Action / CTA):** Un botón en el correo que lleva al dueño con un solo clic a la pantalla exacta donde debe aprobar el pedido.
* **Gateway de Mensajería:** Un intermediario tecnológico que permite a un programa de computadora enviar mensajes a aplicaciones como WhatsApp o SMS.

