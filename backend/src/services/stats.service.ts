import { prisma } from '../config/prisma';

export class StatsService {
  public static async getDashboardStats() {
    // 1. Counts of payment statuses
    const pendingVerificationCount = await prisma.payment.count({ where: { status: 'PENDING_VERIFICATION' } });
    const approvedCount = await prisma.payment.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await prisma.payment.count({ where: { status: 'REJECTED' } });

    // 2. Fetch ALL orders where payment is strictly APPROVED
    const approvedOrders = await prisma.order.findMany({
      where: {
        payment: { status: 'APPROVED' }
      },
      include: {
        items: true
      }
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const order of approvedOrders) {
      totalRevenue += order.total;
      for (const item of order.items) {
        totalCost += item.unitCost * item.quantity;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: '', quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
      }
    }

    const netProfit = totalRevenue - totalCost;

    // Attach product names to top sales
    const products = await prisma.product.findMany({
      where: { id: { in: Object.keys(productSalesMap) } },
      select: { id: true, name: true }
    });

    products.forEach((p) => {
      if (productSalesMap[p.id]) {
        productSalesMap[p.id].name = p.name;
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Demand Forecast (Simple moving average / daily sales projection over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApprovedOrders = approvedOrders.filter((o) => o.createdAt >= thirtyDaysAgo);
    const totalRecentUnits = recentApprovedOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const averageDailyDemand = totalRecentUnits / 30;
    const projectedDemandNextMonth = Math.round(averageDailyDemand * 30);

    return {
      metrics: {
        pendingVerificationCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
        totalCost,
        netProfit
      },
      topSellingProducts,
      demandForecast: {
        averageDailyDemand: Number(averageDailyDemand.toFixed(2)),
        projectedDemandNextMonth
      }
    };
  }
}
