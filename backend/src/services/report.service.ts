import { prisma } from '../config/prisma';
import { PdfGenerator } from '../utils/pdfGenerator';

export class ReportService {
  public static async generateOrderPdf(orderId: string) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
      include: {
        client: true,
        items: { include: { product: true } },
        payment: true
      }
    });

    if (!order) throw new Error('Pedido no encontrado');

    return PdfGenerator.generateOrderPdf(order);
  }

  public static async generateSalesReportPdf() {
    const approvedOrders = await prisma.order.findMany({
      where: { payment: { status: 'APPROVED' } },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = approvedOrders.reduce((sum, o) => sum + o.total, 0);

    return PdfGenerator.generateSalesReportPdf(approvedOrders, totalSales, approvedOrders.length);
  }
}
