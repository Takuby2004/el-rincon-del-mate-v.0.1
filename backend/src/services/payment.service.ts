import { prisma } from '../config/prisma';
import { EmailService } from './email.service';
import { OrderService } from './order.service';
import { AppError } from '../errors/AppError';

export class PaymentService {
  public static async approvePayment(paymentId: string, reviewerUserId: string, notifyEmail: boolean = true) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } }
          }
        }
      }
    });

    if (!payment) throw AppError.notFound('Pago no encontrado');
    if (payment.status === 'APPROVED') throw AppError.badRequest('Este pago ya fue verificado y APROBADO anteriormente.');

    // Delegar en OrderService.updateOrderStatus para máquina de estados, transaccionalidad y consistencia
    const updatedOrder = await OrderService.updateOrderStatus(payment.orderId, 'PAID', reviewerUserId);
    const updatedPayment = updatedOrder.payment;

    // Notificar al cliente por correo si se solicita
    let emailResult = null;
    if (notifyEmail && updatedOrder.client?.email) {
      try {
        emailResult = await EmailService.sendPaymentStatusNotification(updatedOrder, updatedPayment, 'APPROVED');
      } catch (emailErr) {
        console.error('Error al enviar correo de pago aprobado:', emailErr);
      }
    }

    return {
      payment: updatedPayment,
      emailNotified: !!emailResult,
      emailResult
    };
  }

  public static async rejectPayment(
    paymentId: string,
    rejectionReason: string,
    reviewerUserId: string,
    notifyEmail: boolean = true
  ) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw AppError.badRequest('Debe proporcionar una razón o motivo justificado para rechazar el pago.');
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } }
          }
        }
      }
    });

    if (!payment) throw AppError.notFound('Pago no encontrado');
    if (payment.status === 'REJECTED') throw AppError.badRequest('Este pago ya fue RECHAZADO anteriormente.');

    // Delegar en OrderService.updateOrderStatus para máquina de estados, restauración de stock y transacción atómica
    const updatedOrder = await OrderService.updateOrderStatus(
      payment.orderId,
      'PAYMENT_REJECTED',
      reviewerUserId,
      rejectionReason.trim()
    );
    const updatedPayment = updatedOrder.payment;

    // Notificar al cliente por correo con el motivo de rechazo
    let emailResult = null;
    if (notifyEmail && updatedOrder.client?.email) {
      try {
        emailResult = await EmailService.sendPaymentStatusNotification(
          updatedOrder,
          updatedPayment,
          'REJECTED',
          rejectionReason.trim()
        );
      } catch (emailErr) {
        console.error('Error al enviar correo de pago rechazado:', emailErr);
      }
    }

    return {
      payment: updatedPayment,
      emailNotified: !!emailResult,
      emailResult
    };
  }

  public static async notifyPaymentStatusByEmail(paymentId: string, statusOverride?: string, customMessage?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } }
          }
        }
      }
    });

    if (!payment) throw AppError.notFound('Pago no encontrado');
    if (!payment.order?.client?.email) {
      throw AppError.badRequest('El pedido no tiene un correo electrónico de comprador asociado.');
    }

    const emailResult = await EmailService.sendPaymentStatusNotification(
      payment.order,
      payment,
      statusOverride || payment.status,
      customMessage
    );

    return {
      success: true,
      message: `Notificación enviada exitosamente a ${payment.order.client.email}`,
      emailResult
    };
  }
}
