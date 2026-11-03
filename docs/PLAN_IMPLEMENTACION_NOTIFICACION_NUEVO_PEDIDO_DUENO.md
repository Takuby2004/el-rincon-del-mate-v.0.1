# Plan de Implementación: Notificación por Correo al Dueño ante Nuevos Pedidos

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Modificados:** [`email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts), [`order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts)  

---

## 1. Resumen de la Funcionalidad

Se implementó el sistema de **alerta en tiempo real por correo electrónico** para el administrador/dueño de la tienda:
* En cuanto un cliente completa el proceso de compra (`checkout`) y sube su comprobante de pago por transferencia bancaria, el servidor backend despacha de forma asíncrona un correo electrónico directo al Administrador.
* **Resiliencia:** El envío del correo se ejecuta en segundo plano (`.catch(...)`), lo que garantiza que si el servidor SMTP tuviese una demora o fallo momentáneo de red, la compra del cliente **no se interrumpe** y la orden queda guardada de forma segura en la base de datos.

---

## 2. Contenido de la Alerta Recibida por el Dueño

Cada vez que un cliente realiza un pedido, el dueño recibe un correo con:

1. **Cabecera de Alerta:**
   - 🚨 **Asunto:** `[Nuevo Pedido] Orden #ORD-2026-XXXX (Bs. 320.00) - Juan Pérez`
2. **Acción Rápida (Botón CTA):**
   - Enlace directo al panel de control (`/admin/pedidos`) para que con un solo clic el dueño pueda revisar el comprobante y aprobar o rechazar el pedido.
3. **Ficha Completa del Comprador:**
   - Nombre completo.
   - Correo electrónico.
   - Teléfono / WhatsApp con enlace directo (`https://wa.me/591...`).
   - Ciudad de entrega y Dirección de envío.
   - Notas o instrucciones especiales dejadas por el cliente.
4. **Desglose de Productos:**
   - Lista de productos comprados, cantidades y subtotales.
   - Monto total a cobrar en Bolivianos (Bs.).

---

## 3. Archivos Modificados

| Archivo | Cambio Realizado |
| :--- | :--- |
| [`backend/src/services/email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts) | Añadidos los métodos `sendNewOrderAdminAlert` y `generateNewOrderAdminHtml`. |
| [`backend/src/services/order.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/order.service.ts) | Integrado el disparo asíncrono de la alerta en `createOrder`. |
| [`README.md`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) | Documentada la nueva capacidad de notificación inmediata al administrador. |

---

## 4. Glosario Técnico (Nivel Junior) 📚

* **Despacho Asíncrono (Fire-and-Forget / Background Task):** Ejecutar una tarea (como mandar un correo) "de fondo" sin hacer esperar al cliente en la pantalla de carga. Así la página web responde de inmediato y el correo se envía paralelamente.
* **Call to Action (CTA):** Un botón llamativo dentro de un correo electrónico diseñado para guiar al usuario a la acción principal (en este caso, revisar el comprobante en el panel).
* **Entropía Criptográfica:** Generación de códigos únicos impredecibles para los números de orden (`ORD-261103-XXXX`), evitando que curiosos intenten adivinar números de pedidos de otros clientes.

