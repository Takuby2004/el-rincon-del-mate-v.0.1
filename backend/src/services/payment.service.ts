import { prisma } from '../config/prisma';
import { EmailService } from './email.service';

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

    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status === 'APPROVED') throw new Error('Este pago ya fue verificado y APROBADO anteriormente.');

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewerUserId,
          reviewedAt: new Date()
        },
        include: { paymentProof: true }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'APPROVED'
        }
      });

      return updated;
    });

    // Notify buyer via email if requested
    let emailResult = null;
    if (notifyEmail && payment.order?.client?.email) {
      try {
        emailResult = await EmailService.sendPaymentStatusNotification(payment.order, updatedPayment, 'APPROVED');
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

  public static async rejectPayment(paymentId: string, rejectionReason: string, reviewerUserId: string, notifyEmail: boolean = true) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Debe proporcionar una razón o motivo justificado para rechazar el pago.');
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

    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status === 'REJECTED') throw new Error('Este pago ya fue RECHAZADO anteriormente.');

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          rejectionReason,
          reviewedBy: reviewerUserId,
          reviewedAt: new Date()
        },
        include: { paymentProof: true }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAYMENT_REJECTED',
          paymentStatus: 'REJECTED'
        }
      });

      // Restore stock for all items in the rejected order
      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            userId: reviewerUserId,
            type: 'PAYMENT_REJECTED',
            quantity: item.quantity,
            reason: `Restauración de stock por pago rechazado en pedido #${payment.order.orderNumber}. Motivo: ${rejectionReason}`
          }
        });
      }

      return updated;
    });

    // Notify buyer via email if requested
    let emailResult = null;
    if (notifyEmail && payment.order?.client?.email) {
      try {
        emailResult = await EmailService.sendPaymentStatusNotification(
          payment.order,
          updatedPayment,
          'REJECTED',
          rejectionReason
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

    if (!payment) throw new Error('Pago no encontrado');
    if (!payment.order?.client?.email) {
      throw new Error('El pedido no tiene un correo electrónico de comprador asociado.');
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
