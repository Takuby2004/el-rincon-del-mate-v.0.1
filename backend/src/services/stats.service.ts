import { prisma } from '../config/prisma';

export class StatsService {
  public static async getDashboardStats(days: number = 7) {
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
      totalRevenue += Number(order.total);
      for (const item of order.items) {
        totalCost += Number(item.unitCost) * item.quantity;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: '', quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += Number(item.subtotal);
      }
    }

    const netProfit = totalRevenue - totalCost;
    const profitMarginPercentage = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

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

    // 3. Histograma de Distribución de Montos por Pedido (Ticket Bins)
    const bins = [
      { range: 'Bs. 0 - 150', min: 0, max: 150, count: 0, percentage: 0 },
      { range: 'Bs. 151 - 300', min: 150.01, max: 300, count: 0, percentage: 0 },
      { range: 'Bs. 301 - 600', min: 300.01, max: 600, count: 0, percentage: 0 },
      { range: 'Bs. 600+', min: 600.01, max: Infinity, count: 0, percentage: 0 }
    ];

    for (const order of approvedOrders) {
      const orderTotalNum = Number(order.total);
      const targetBin = bins.find((b) => orderTotalNum >= b.min && orderTotalNum <= b.max);
      if (targetBin) {
        targetBin.count += 1;
      }
    }

    const totalApprovedCount = approvedOrders.length;
    const orderDistribution = bins.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: totalApprovedCount > 0 ? Number(((b.count / totalApprovedCount) * 100).toFixed(1)) : 0
    }));

    // 4. Histograma Temporal: Ventas Diarias de los Últimos N Días
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dailySalesHistory: { date: string; label: string; count: number; total: number }[] = [];
    const effectiveDays = Math.max(1, Math.min(days, 90));

    for (let i = effectiveDays - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const dayName = daysOfWeek[targetDate.getDay()];
      const label = effectiveDays > 14 ? `${day}/${month}` : `${dayName} ${day}/${month}`;

      const dayOrders = approvedOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getFullYear() === targetDate.getFullYear() &&
          orderDate.getMonth() === targetDate.getMonth() &&
          orderDate.getDate() === targetDate.getDate()
        );
      });

      const dayCount = dayOrders.length;
      const dayTotal = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);

      dailySalesHistory.push({
        date: dateKey,
        label,
        count: dayCount,
        total: Number(dayTotal.toFixed(2))
      });
    }

    return {
      metrics: {
        pendingVerificationCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
        totalCost,
        netProfit,
        profitMarginPercentage
      },
      topSellingProducts,
      demandForecast: {
        averageDailyDemand: Number(averageDailyDemand.toFixed(2)),
        projectedDemandNextMonth
      },
      orderDistribution,
      dailySalesHistory
    };
  }
}
