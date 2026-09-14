import nodemailer, { Transporter } from 'nodemailer';

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
    const smtpPass = process.env.SMTP_PASS?.trim();
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
                  📲 Escríbenos directamente a nuestro WhatsApp de atención al cliente.
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

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"El Rincón del Mate" <no-reply@elrincondelmate.com>';

    const { transporter, isTestAccount } = await this.getTransporter();

    console.log(`[EmailService] 🚀 Despachando correo a: ${recipientEmail} [Estado: ${finalStatus}]...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject,
      html: htmlContent
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
}

