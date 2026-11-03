# Propuesta Técnica: Unificación del Correo del Administrador con el Emisor de Notificaciones

**Fecha:** 3 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Evaluados:** [`email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts), [`profile.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts), [`.env`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/.env)  

---

## 1. Diagnóstico Actual

Actualmente en el sistema existen variables separadas para el correo:

1. **Correo de Acceso del Administrador (`ADMIN_EMAIL` / Base de Datos):**
   - En `.env`: `ADMIN_EMAIL="leonardoazamavillena@gmail.com"`.
   - En la base de datos: La tabla `User` con `role: "ADMIN"`.
   - Es el correo que usa el dueño para iniciar sesión en el panel y que ahora se puede modificar desde la sección **"Perfil"**.

2. **Correo de Envío de Notificaciones a Clientes (`EMAIL_FROM` y `SMTP_USER`):**
   - En `.env`:
     - `SMTP_USER="leonardoazamavillena@gmail.com"` (Cuenta que se autentica ante Gmail).
     - `EMAIL_FROM="El Rincón del Mate <notificaciones@elrincondelmate.com>"` (Etiqueta de remitente visible).
   - En [`email.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts#L264):
     ```typescript
     const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"El Rincón del Mate" <no-reply@elrincondelmate.com>';
     ```

### El Desfase Actual:
- El remitente visible que reciben los clientes dice `notificaciones@elrincondelmate.com`, en vez de mostrar el correo real del administrador.
- Si el cliente presiona el botón "Responder" en su correo, no le responderá al administrador.
- Si el administrador cambia su correo en la sección **"Perfil"**, el servicio de correos no se entera porque solo lee la variable estática de entorno.

---

## 2. Solución Propuesta: Unificación Dinámica

Para que el correo del administrador sea el encargado directo de las notificaciones:

### A. Remitente Dinámico (`From`) y Respuesta Directa (`Reply-To`):
1. Cuando [`EmailService`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts) vaya a despachar una notificación de pedido:
   - Consulta automáticamente en la base de datos el correo actual del Administrador (`prisma.user.findFirst({ where: { role: 'ADMIN' } })`).
   - Si no lo encuentra, usa como respaldo `process.env.ADMIN_EMAIL` o `process.env.SMTP_USER`.
2. Configura el correo de salida con:
   - **`from`:** `"El Rincón del Mate" <correo_del_administrador>`
   - **`replyTo`:** `correo_del_administrador`
   - *Resultado:* El cliente verá que el correo viene de la tienda con la dirección del administrador y, si le da a "Responder", el mensaje llegará directamente a la bandeja de entrada del dueño.

### B. Autenticación SMTP (Servidor de Envío):
- Si el correo del administrador es de Gmail, se utiliza con su respectiva *Contraseña de Aplicación* de 16 caracteres (`SMTP_PASS`).
- En el archivo `.env`, se unifica `EMAIL_FROM` para que coincida con el correo del administrador:
  ```env
  SMTP_USER="leonardoazamavillena@gmail.com"
  EMAIL_FROM="El Rincón del Mate <leonardoazamavillena@gmail.com>"
  ADMIN_EMAIL="leonardoazamavillena@gmail.com"
  ```

---

## 3. Glosario Técnico (Nivel Junior) 📚

* **Cabecera `From` (Remitente):** La dirección y nombre que el cliente ve en su bandeja de entrada (ej: *"El Rincón del Mate" <dueno@gmail.com>*).
* **Cabecera `Reply-To` (Responder a):** Dirección a donde se envían las respuestas si el cliente hace clic en el botón "Responder" de su aplicación de correo.
* **SMTP (Simple Mail Transfer Protocol):** El protocolo que utiliza tu backend para conectarse al servidor de correo (por ejemplo, los servidores de Google) y pedirle que envíe un email.
* **Contraseña de Aplicación (App Password):** Una clave especial de 16 caracteres generada por Google que le permite a aplicaciones seguras enviar correos sin exponer la contraseña principal de la cuenta.

