import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '../config/prisma';

export interface EmailNotificationResult {
  success: boolean;
  recipient: string;
  subject: string;
  status: string;
  orderNumber: string;
  sentAt: Date;
  previewText?: string;
  messageId?: string;
  previewUrl?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initializes or returns a cached nodemailer transporter
   */
  private static async getTransporter(): Promise<{ transporter: Transporter; isTestAccount: boolean }> {
    const smtpUser = process.env.SMTP_USER?.trim();
    const rawPass = process.env.SMTP_PASS?.trim() || '';
    // Sanitizar espacios accidentales propios del formato de Google App Passwords (xxxx xxxx xxxx xxxx)
    const smtpPass = rawPass.replace(/\s+/g, '');
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    // If real credentials are provided in .env, create standard SMTP transporter
    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      return { transporter, isTestAccount: false };
    }

    // Fallback: If no credentials in .env, use Ethereal Email test account for development
    if (!this.transporter) {
      console.log('[EmailService] ℹ️ Sin credenciales SMTP en .env. Creando cuenta de prueba en Ethereal Email...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    return { transporter: this.transporter, isTestAccount: true };
  }

  /**
   * Generates a modern, responsive HTML email template for order and payment status notification
   */
  private static generatePaymentStatusHtml(order: any, payment: any, statusToReport: string, customNote?: string): string {
    const isApproved = statusToReport === 'APPROVED';
    const isRejected = statusToReport === 'REJECTED';
    const isPending = statusToReport === 'PENDING_VERIFICATION';

    const statusTitle = isApproved
      ? '¡Tu Pago ha sido Aprobado!'
      : isRejected
      ? 'Actualización: Pago No Aprobado'
      : 'Comprobante de Pago en Revisión';

    const statusColor = isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#b45309';
    const statusBg = isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7';
    const statusIcon = isApproved ? '✅' : isRejected ? '❌' : '⏳';

    const clientName = order.client?.name || 'Estimado(a) Cliente';
    const orderNumber = order.orderNumber || 'N/A';
    const totalBs = Number(order.total || 0).toFixed(2);
    const items = order.items || [];

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1ece4; font-size: 13px; color: #2d1e18;">
          <strong>${item.product?.name || 'Producto'}</strong>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1ece4; font-size: 13px; text-align: center; color: #5c473b;">
          ${item.quantity} un.
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1ece4; font-size: 13px; text-align: right; font-weight: bold; color: #2d1e18;">
          Bs. ${Number(item.subtotal || 0).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle} - El Rincón del Mate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f4ef; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #2d1e18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ef; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8decb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #24422e; padding: 28px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
                🌿 EL RINCÓN DEL MATE
              </h1>
              <p style="color: #d1e7d8; margin: 6px 0 0 0; font-size: 12px;">
                Cultura, tradición y accesorios materos artesanales
              </p>
            </td>
          </tr>

          <!-- Main Status Banner -->
          <tr>
            <td style="padding: 30px 30px 15px 30px;">
              <div style="background-color: ${statusBg}; border-left: 5px solid ${statusColor}; padding: 18px 20px; border-radius: 12px; margin-bottom: 24px;">
                <h2 style="color: ${statusColor}; margin: 0 0 6px 0; font-size: 17px; font-weight: 700;">
                  ${statusIcon} ${statusTitle}
                </h2>
                <p style="color: #4b382a; margin: 0; font-size: 13px; line-height: 1.5;">
                  ${isApproved 
                    ? `Hemos verificado exitosamente tu comprobante bancario. Tu pedido <strong>#${orderNumber}</strong> ya se encuentra confirmado y pasará al área de empaque y despacho.`
                    : isRejected
                    ? `Tu comprobante de pago para el pedido <strong>#${orderNumber}</strong> no pudo ser aprobado. Por favor revisa el motivo a continuación para coordinar una solución.`
                    : `Hemos recibido tu comprobante para el pedido <strong>#${orderNumber}</strong> y nuestro equipo lo está verificando.`}
                </p>
              </div>

              <!-- Rejection Reason or Custom Note if any -->
              ${(customNote || (isRejected && payment?.rejectionReason)) ? `
                <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                  <strong style="color: #9f1239; font-size: 12px; text-transform: uppercase;">Nota del Administrador:</strong>
                  <p style="color: #881337; margin: 4px 0 0 0; font-size: 13px; line-height: 1.4;">
                    ${customNote || payment?.rejectionReason}
                  </p>
                </div>
              ` : ''}

              <!-- Greeting -->
              <p style="font-size: 14px; margin: 0 0 16px 0; color: #2d1e18;">
                Hola <strong>${clientName}</strong>,
              </p>
              <p style="font-size: 13px; color: #5c473b; line-height: 1.6; margin: 0 0 24px 0;">
                A continuación te compartimos los detalles de tu compra:
              </p>

              <!-- Order Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf7f2; border-radius: 14px; border: 1px solid #ebdcc5; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; color: #785e4d;">Número de Pedido:</td>
                        <td style="font-size: 13px; font-weight: bold; color: #2d1e18; text-align: right; font-family: monospace;">#${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #785e4d; padding-top: 8px;">Dirección de Entrega:</td>
                        <td style="font-size: 12px; color: #2d1e18; text-align: right; padding-top: 8px;">${order.address || 'N/A'}, ${order.city || 'Santa Cruz'}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #785e4d; padding-top: 8px;">Teléfono de Contacto:</td>
                        <td style="font-size: 12px; color: #2d1e18; text-align: right; padding-top: 8px;">${order.phone || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Products Table -->
              <h3 style="font-size: 13px; color: #785e4d; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                Resumen de Productos
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f1ece4;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #5c473b; text-transform: uppercase;">Producto</th>
                    <th style="padding: 8px 12px; text-align: center; font-size: 11px; color: #5c473b; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 11px; color: #5c473b; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 14px 12px; text-align: right; font-size: 14px; font-weight: bold; color: #2d1e18; border-top: 2px solid #24422e;">
                      TOTAL:
                    </td>
                    <td style="padding: 14px 12px; text-align: right; font-size: 16px; font-weight: 800; color: #24422e; border-top: 2px solid #24422e;">
                      Bs. ${totalBs}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Help & Contact CTA -->
              <div style="background-color: #f1ece4; border-radius: 12px; padding: 16px; text-align: center; margin-top: 25px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #5c473b;">
                  ¿Tienes alguna duda o necesitas coordinar tu entrega?
                </p>
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #24422e;">
                  📲 Escríbenos a nuestro WhatsApp o responde directamente a este correo.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; border-top: 1px solid #ebdcc5; padding: 20px 30px; text-align: center; font-size: 11px; color: #8c7361;">
              <p style="margin: 0 0 4px 0;">
                © 2026 <strong>El Rincón del Mate</strong> - Todos los derechos reservados.
              </p>
              <p style="margin: 0;">
                Este es un mensaje automático generado por el sistema de verificación de compras.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Genera la versión en texto plano para el correo de estado de pago (esencial para evitar filtros de SPAM)
   */
  private static generatePaymentStatusPlainText(
    order: any,
    payment: any,
    statusToReport: string,
    customNote?: string
  ): string {
    const isApproved = statusToReport === 'APPROVED';
    const isRejected = statusToReport === 'REJECTED';
    const statusText = isApproved ? 'APROBADO ✅' : isRejected ? 'RECHAZADO ❌' : 'PENDIENTE DE VERIFICACIÓN ⏳';
    const clientName = order.client?.name || 'Cliente';
    const totalBs = Number(order.total || 0).toFixed(2);
    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const orderUrl = `${frontendBaseUrl}/pedido/${order.orderNumber}`;

    let message = `EL RINCÓN DEL MATE - Notificación de Pedido #${order.orderNumber}\n\n`;
    message += `Estimado(a) ${clientName},\n\n`;
    message += `Le informamos que el estado de su pago para el pedido #${order.orderNumber} es: ${statusText}.\n`;
    message += `Total del pedido: Bs. ${totalBs}\n\n`;

    if (isApproved) {
      message += `Su comprobante ha sido verificado con éxito. Ya estamos preparando su paquete de mates para el despacho.\n\n`;
    } else if (isRejected) {
      const reason = customNote || payment?.rejectionReason || 'Comprobante no legible o monto incorrecto.';
      message += `Motivo del rechazo: "${reason}".\n`;
      message += `Por favor, comuníquese con nosotros para reenviar un comprobante válido.\n\n`;
    }

    message += `Puede consultar el seguimiento de su pedido en el siguiente enlace:\n${orderUrl}\n\n`;
    message += `Atentamente,\nEl Rincón del Mate\nTarija & La Paz, Bolivia\n`;

    return message;
  }

  /**
   * Obtiene dinámicamente la información del administrador de la tienda para el remitente
   */
  private static async getAdminSender(): Promise<{ email: string; name: string; fromAddress: string }> {
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { email: true, name: true }
      });

      const adminEmail =
        adminUser?.email?.trim() ||
        process.env.ADMIN_EMAIL?.trim() ||
        process.env.SMTP_USER?.trim() ||
        'notificaciones@elrincondelmate.com';

      const brandName = 'El Rincón del Mate';
      const fromAddress = `"${brandName}" <${adminEmail}>`;

      return {
        email: adminEmail,
        name: adminUser?.name || brandName,
        fromAddress
      };
    } catch (err) {
      console.warn('[EmailService] Advertencia al consultar administrador en BD para remitente:', err);
      const fallbackEmail =
        process.env.ADMIN_EMAIL?.trim() ||
        process.env.SMTP_USER?.trim() ||
        'notificaciones@elrincondelmate.com';
      return {
        email: fallbackEmail,
        name: 'El Rincón del Mate',
        fromAddress: `"El Rincón del Mate" <${fallbackEmail}>`
      };
    }
  }

  /**
   * Sends payment status notification to buyer using Nodemailer
   */
  public static async sendPaymentStatusNotification(
    order: any,
    payment: any,
    statusOverride?: string,
    customNote?: string
  ): Promise<EmailNotificationResult> {
    const recipientEmail = order.client?.email;
    if (!recipientEmail) {
      throw new Error('El comprador no tiene un correo electrónico registrado en el pedido.');
    }

    const finalStatus = statusOverride || payment?.status || order.paymentStatus || 'PENDING_VERIFICATION';
    const statusLabels: Record<string, string> = {
      APPROVED: 'Aprobado ✅',
      REJECTED: 'Rechazado ❌',
      PENDING_VERIFICATION: 'Pendiente de Verificación ⏳'
    };

    const subject = `[El Rincón del Mate] Estado de Pago: ${statusLabels[finalStatus] || finalStatus} - Pedido #${order.orderNumber}`;
    const htmlContent = this.generatePaymentStatusHtml(order, payment, finalStatus, customNote);
    const textContent = this.generatePaymentStatusPlainText(order, payment, finalStatus, customNote);

    const adminSender = await this.getAdminSender();
    const { transporter, isTestAccount } = await this.getTransporter();

    console.log(`[EmailService] 🚀 Despachando correo a: ${recipientEmail} [Desde: ${adminSender.fromAddress}] [Estado: ${finalStatus}]...`);

    const info = await transporter.sendMail({
      from: adminSender.fromAddress,
      replyTo: adminSender.email,
      to: recipientEmail,
      subject,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'El Rincon del Mate Mailer 1.0',
        'X-Priority': '3',
        'X-Entity-Ref-ID': `order-${order.orderNumber}`
      }
    });

    let previewUrl: string | undefined;
    if (isTestAccount) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        previewUrl = testUrl;
        console.log(`[EmailService] 🔗 Enlace de vista previa del correo (Ethereal): ${testUrl}`);
      }
    } else {
      console.log(`[EmailService] ✅ Correo entregado exitosamente al servidor SMTP. Message ID: ${info.messageId}`);
    }

    return {
      success: true,
      recipient: recipientEmail,
      subject,
      status: finalStatus,
      orderNumber: order.orderNumber,
      sentAt: new Date(),
      messageId: info.messageId,
      previewUrl,
      previewText: `Correo ${isTestAccount ? 'enviado a buzón de prueba' : 'enviado exitosamente'} a ${recipientEmail}`
    };
  }

  /**
   * Genera la plantilla HTML para notificar al administrador de un nuevo pedido entrante
   */
  private static generateNewOrderAdminHtml(order: any, payment: any): string {
    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const adminOrdersUrl = `${frontendBaseUrl}/admin/pedidos`;

    const client = order.client || {};
    const clientName = client.name || 'Cliente';
    const clientEmail = client.email || order.phone || 'No especificado';
    const clientPhone = order.phone || client.phone || 'No especificado';
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const clientAddress = order.address || client.address || 'Recojo en sucursal';
    const clientCity = order.city || client.city || 'Santa Cruz';
    const clientNotes = order.notes || 'Sin notas especiales.';

    const items = order.items || [];
    let itemsHtml = '';

    for (const item of items) {
      const prodName = item.product?.name || 'Producto';
      const qty = item.quantity || 1;
      const subtotal = Number(item.subtotal || item.unitPrice * qty).toFixed(2);

      itemsHtml += `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #ebdcc5; font-size: 13px; color: #2d1e18;">
            <strong>${prodName}</strong>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #ebdcc5; font-size: 13px; text-align: center; color: #5c473b;">
            x${qty}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #ebdcc5; font-size: 13px; text-align: right; color: #2d1e18;">
            Bs. ${subtotal}
          </td>
        </tr>
      `;
    }

    const totalBs = Number(order.total || 0).toFixed(2);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nuevo Pedido #${order.orderNumber} - El Rincón del Mate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f4ef; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #2d1e18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ef; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8decb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #24422e; padding: 26px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
                🌿 EL RINCÓN DEL MATE
              </h1>
              <p style="color: #d1e7d8; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">
                🔔 Notificación para el Administrador
              </p>
            </td>
          </tr>

          <!-- Banner Alerta -->
          <tr>
            <td style="padding: 30px 30px 15px 30px;">
              <div style="background-color: #fefce8; border-left: 5px solid #ca8a04; padding: 18px 20px; border-radius: 12px; margin-bottom: 24px;">
                <h2 style="color: #854d0e; margin: 0 0 6px 0; font-size: 17px; font-weight: 800;">
                  🚨 ¡Tienes un Nuevo Pedido Pendiente de Verificación!
                </h2>
                <p style="color: #713f12; margin: 0; font-size: 13px; line-height: 1.5;">
                  El cliente <strong>${clientName}</strong> acaba de completar un pedido en la tienda web y ha adjuntado su comprobante de transferencia bancaria por <strong>Bs. ${totalBs}</strong>.
                </p>
              </div>

              <!-- CTA Button Directo a Pedidos -->
              <div style="text-align: center; margin: 25px 0 30px 0;">
                <a href="${adminOrdersUrl}" target="_blank" style="background-color: #24422e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(36,66,46,0.3);">
                  🔍 Ver y Aprobar Pedido en el Panel
                </a>
              </div>

              <!-- Ficha del Comprador -->
              <h3 style="color: #24422e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 2px solid #ebdcc5; padding-bottom: 6px;">
                👤 Datos del Comprador
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="6" style="margin-bottom: 25px; font-size: 13px;">
                <tr>
                  <td width="35%" style="color: #7a6352; font-weight: 600;">Cliente:</td>
                  <td style="color: #2d1e18; font-weight: bold;">${clientName}</td>
                </tr>
                <tr>
                  <td style="color: #7a6352; font-weight: 600;">Correo:</td>
                  <td style="color: #2d1e18;">${clientEmail}</td>
                </tr>
                <tr>
                  <td style="color: #7a6352; font-weight: 600;">Teléfono / Celular:</td>
                  <td>
                    <a href="https://wa.me/${cleanPhone.startsWith('591') ? cleanPhone : '591' + cleanPhone}" target="_blank" style="color: #15803d; font-weight: bold; text-decoration: none;">
                      📱 ${clientPhone} (Abrir WhatsApp)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #7a6352; font-weight: 600;">Ciudad de Entrega:</td>
                  <td style="color: #2d1e18; font-weight: bold;">${clientCity}</td>
                </tr>
                <tr>
                  <td style="color: #7a6352; font-weight: 600;">Dirección:</td>
                  <td style="color: #2d1e18;">${clientAddress}</td>
                </tr>
                ${order.notes ? `
                <tr>
                  <td style="color: #7a6352; font-weight: 600;">Notas del Cliente:</td>
                  <td style="color: #854d0e; font-style: italic;">"${clientNotes}"</td>
                </tr>
                ` : ''}
              </table>

              <!-- Detalle de Productos -->
              <h3 style="color: #24422e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 2px solid #ebdcc5; padding-bottom: 6px;">
                🧉 Productos del Pedido #${order.orderNumber}
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #ebdcc5; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                <thead>
                  <tr style="background-color: #f1ece4; color: #5c473b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th style="padding: 10px 12px; text-align: left;">Producto</th>
                    <th style="padding: 10px 12px; text-align: center;">Cantidad</th>
                    <th style="padding: 10px 12px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 14px 12px; text-align: right; font-size: 14px; font-weight: bold; color: #2d1e18; border-top: 2px solid #24422e;">
                      TOTAL A COBRAR:
                    </td>
                    <td style="padding: 14px 12px; text-align: right; font-size: 16px; font-weight: 800; color: #24422e; border-top: 2px solid #24422e;">
                      Bs. ${totalBs}
                    </td>
                  </tr>
                </tfoot>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; border-top: 1px solid #ebdcc5; padding: 18px 30px; text-align: center; font-size: 11px; color: #8c7361;">
              <p style="margin: 0;">
                Sistema de Notificaciones Administrativas de <strong>El Rincón del Mate</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Genera la versión en texto plano para la alerta de nuevo pedido al dueño (esencial para evitar SPAM)
   */
  private static generateNewOrderAdminPlainText(order: any, payment: any): string {
    const client = order.client || {};
    const clientName = client.name || 'Cliente';
    const clientPhone = order.phone || client.phone || 'No especificado';
    const clientEmail = client.email || 'No especificado';
    const clientAddress = order.address || client.address || 'Recojo en sucursal';
    const clientCity = order.city || client.city || 'Santa Cruz';
    const totalBs = Number(order.total || 0).toFixed(2);
    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const adminOrdersUrl = `${frontendBaseUrl}/admin/pedidos`;

    let message = `🚨 ¡NUEVO PEDIDO RECIBIDO! - El Rincón del Mate\n\n`;
    message += `Se ha generado una nueva orden en la tienda web:\n`;
    message += `-----------------------------------------\n`;
    message += `Número de Pedido: #${order.orderNumber}\n`;
    message += `Cliente: ${clientName}\n`;
    message += `Teléfono: ${clientPhone}\n`;
    message += `Correo: ${clientEmail}\n`;
    message += `Dirección: ${clientAddress}, ${clientCity}\n`;
    message += `Total a Cobrar: Bs. ${totalBs}\n`;
    message += `Estado de Pago: PENDIENTE DE VERIFICACIÓN\n`;
    message += `-----------------------------------------\n\n`;
    message += `Productos en el pedido:\n`;

    const items = order.items || [];
    for (const it of items) {
      const name = it.product?.name || 'Producto';
      const qty = it.quantity || 1;
      const subtotal = Number(it.subtotal || it.unitPrice * qty).toFixed(2);
      message += `- ${name} x${qty} (Bs. ${subtotal})\n`;
    }

    message += `\nIngrese al panel administrativo para verificar el comprobante adjunto y aprobar el pedido:\n`;
    message += `${adminOrdersUrl}\n`;

    return message;
  }

  /**
   * Envía una notificación por correo electrónico al Administrador alertando sobre un nuevo pedido entrante
   */
  public static async sendNewOrderAdminAlert(
    order: any,
    payment: any
  ): Promise<EmailNotificationResult | null> {
    try {
      const adminSender = await this.getAdminSender();
      const recipientEmail = adminSender.email;

      if (!recipientEmail) {
        console.warn('[EmailService] ⚠️ No se encontró correo de administrador para enviar la alerta de nuevo pedido.');
        return null;
      }

      const clientName = order.client?.name || 'Cliente';
      const totalBs = Number(order.total || 0).toFixed(2);
      const subject = `🚨 [Nuevo Pedido] Orden #${order.orderNumber} (Bs. ${totalBs}) - ${clientName}`;
      const htmlContent = this.generateNewOrderAdminHtml(order, payment);
      const textContent = this.generateNewOrderAdminPlainText(order, payment);

      const { transporter, isTestAccount } = await this.getTransporter();

      console.log(`[EmailService] 🚀 Despachando alerta de nuevo pedido al dueño: ${recipientEmail} [Orden: #${order.orderNumber}]...`);

      const info = await transporter.sendMail({
        from: adminSender.fromAddress,
        to: recipientEmail,
        replyTo: order.client?.email || adminSender.email,
        subject,
        text: textContent,
        html: htmlContent,
        headers: {
          'X-Mailer': 'El Rincon del Mate Mailer 1.0',
          'X-Priority': '1',
          'X-Entity-Ref-ID': `admin-order-${order.orderNumber}`
        }
      });

      let previewUrl: string | undefined;
      if (isTestAccount) {
        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
          previewUrl = testUrl;
          console.log(`[EmailService] 🔗 Enlace de vista previa de alerta al dueño (Ethereal): ${testUrl}`);
        }
      } else {
        console.log(`[EmailService] ✅ Alerta de nuevo pedido entregada al dueño. Message ID: ${info.messageId}`);
      }

      return {
        success: true,
        recipient: recipientEmail,
        subject,
        status: 'NEW_ORDER_ALERT',
        orderNumber: order.orderNumber,
        sentAt: new Date(),
        messageId: info.messageId,
        previewUrl,
        previewText: `Alerta de nuevo pedido enviada al dueño (${recipientEmail})`
      };
    } catch (err: any) {
      console.error('[EmailService] ❌ Error al despachar alerta de nuevo pedido al dueño:', err?.message || err);
      return null;
    }
  }
}

