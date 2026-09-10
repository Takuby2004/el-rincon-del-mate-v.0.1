import { prisma } from '../config/prisma';

export class PaymentService {
  public static async approvePayment(paymentId: string, reviewerUserId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status === 'APPROVED') throw new Error('Este pago ya fue verificado y APROBADO anteriormente.');

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
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

      return updatedPayment;
    });
  }

  public static async rejectPayment(paymentId: string, rejectionReason: string, reviewerUserId: string) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Debe proporcionar una razón o motivo justificado para rechazar el pago.');
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: { items: true }
        }
      }
    });

    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status === 'REJECTED') throw new Error('Este pago ya fue RECHAZADO anteriormente.');

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
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

      return updatedPayment;
    });
  }
}
