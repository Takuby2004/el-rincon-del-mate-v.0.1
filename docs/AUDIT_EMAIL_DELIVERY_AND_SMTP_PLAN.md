# Auditoría y Plan: Envío Real de Correos Electrónicos con Nodemailer y SMTP

**Fecha:** 13 de Septiembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Servicio de Notificaciones por Correo Electrónico  

---

## 1. Diagnóstico del Problema (Auditoría Técnica)

Al revisar el archivo [email.service.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/email.service.ts):
- La generación de la plantilla HTML y la lógica de negocio ya están implementadas.
- Sin embargo, el método `sendPaymentStatusNotification` solo registraba el mensaje en la consola (`console.log`) como simulación previa, ya que el proyecto **no tenía instalado el paquete `nodemailer` ni configuradas las credenciales de servidor SMTP** (como Gmail, Outlook o Ethereal).

Por esta razón, la interfaz mostraba que la acción se ejecutó con éxito, pero ningún correo real salía hacia el servidor de correo del comprador.

---

## 2. Solución Propuesta

### A. Instalación de Dependencias
Instalar en el backend:
- `nodemailer`: Librería estándar de Node.js para conectar con servidores de correo y enviar mensajes MIME / HTML reales.
- `@types/nodemailer`: Definiciones de TypeScript para tipado estricto.

### B. Configuración de Transporte SMTP Dual (Producción / Desarrollo)
1. **Credenciales en `.env` (Gmail, Outlook, Hostinger, SendGrid, etc.):**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER="tucorreo@gmail.com"
   SMTP_PASS="tu_contraseña_de_aplicacion"
   EMAIL_FROM="El Rincón del Mate <tucorreo@gmail.com>"
   ```
2. **Fallback Inteligente con Ethereal Email (Para pruebas sin configurar contraseña):**
   - Si no se configuran credenciales en `.env`, `nodemailer` generará automáticamente una cuenta de prueba en **Ethereal Email** y retornará un enlace web (`nodemailer.getTestMessageUrl(info)`).
   - Dicho enlace se abrirá o se mostrará en consola y en la respuesta de la API, permitiendo ver el email real renderizado en el navegador instantáneamente sin necesidad de credenciales personales.

### C. Conexión Real en `EmailService`
- Reemplazar la simulación de `console.log` por una llamada a `transporter.sendMail(...)`.
- Retornar la URL de visualización (si es cuenta de prueba) o el ID del mensaje enviado al servidor SMTP.

---

## 3. Glosario Técnico (Nivel Junior)

1. **Nodemailer:** Es la herramienta / librería más popular en Node.js que actúa como el "cartero digital", encargada de comunicarse con los servidores de correo (como Gmail) para despachar los emails.
2. **Servidor SMTP (Simple Mail Transfer Protocol):** Es la computadora o servicio en la nube especializado en recibir mensajes de aplicaciones y distribuirlos a las bandejas de entrada de los destinatarios (ej: `smtp.gmail.com`).
3. **Contraseña de Aplicación:** Una clave segura de 16 caracteres generada dentro de tu cuenta de Google / Gmail para permitir que aplicaciones externas (como este backend) envíen correos sin exponer tu contraseña personal ni requerir verificación en dos pasos cada vez.
4. **Ethereal Email:** Un servicio gratuito y seguro diseñado para desarrolladores que simula una bandeja de entrada en la web. Permite verificar cómo llega un correo real y cómo se ve en pantalla sin enviar spam ni requerir configurar cuentas reales.
