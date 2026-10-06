import { prisma } from '../config/prisma';
import { PdfGenerator } from '../utils/pdfGenerator';

function getPeriodFilter(days?: string | number) {
  if (!days || days === 'all') {
    return { filter: undefined, label: 'Todo el Histórico', daysCount: 30 };
  }
  const d = Number(days);
  if (isNaN(d) || d <= 0) {
    return { filter: undefined, label: 'Todo el Histórico', daysCount: 30 };
  }
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - d);
  const label = d === 7 ? 'Últimos 7 días' : d === 30 ? 'Últimos 30 días' : `Últimos ${d} días`;
  return { filter: { gte: startDate }, label, daysCount: d };
}

export class ReportService {
  /**
   * Comprobante individual de un pedido
   */
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

  /**
   * 1. REPORTE DE VENTAS (Pagos Aprobados)
   */
  public static async generateSalesReportPdf(days?: string | number) {
    const { filter, label } = getPeriodFilter(days);

    const approvedOrders = await prisma.order.findMany({
      where: {
        payment: { status: 'APPROVED' },
        ...(filter ? { createdAt: filter } : {})
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = approvedOrders.reduce((sum, o) => sum + Number(o.total), 0);

    return PdfGenerator.generateSalesReportPdf(approvedOrders, totalSales, approvedOrders.length, label);
  }

  /**
   * 2. REPORTE DE COSTOS (COGS y Valuación de Inventario)
   */
  public static async generateCostReportPdf(days?: string | number) {
    const { filter, label } = getPeriodFilter(days);

    // Obtener catálogo completo de productos activos
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: 'asc' }
    });

    // Obtener pedidos aprobados en el período
    const approvedOrders = await prisma.order.findMany({
      where: {
        payment: { status: 'APPROVED' },
        ...(filter ? { createdAt: filter } : {})
      },
      include: { items: true }
    });

    const productCogsMap: Record<string, { quantity: number; totalCost: number }> = {};
    let totalCogs = 0;

    for (const order of approvedOrders) {
      for (const item of order.items) {
        const itemCostTotal = Number(item.unitCost) * item.quantity;
        totalCogs += itemCostTotal;

        if (!productCogsMap[item.productId]) {
          productCogsMap[item.productId] = { quantity: 0, totalCost: 0 };
        }
        productCogsMap[item.productId].quantity += item.quantity;
        productCogsMap[item.productId].totalCost += itemCostTotal;
      }
    }

    let totalInventoryValue = 0;
    const costReportItems = products.map((p) => {
      const stockVal = Number(p.cost) * p.stock;
      totalInventoryValue += stockVal;
      const cogsInfo = productCogsMap[p.id] || { quantity: 0, totalCost: 0 };

      return {
        id: p.id,
        name: p.name,
        categoryName: p.category?.name || 'General',
        stock: p.stock,
        unitCost: Number(p.cost),
        stockValue: stockVal,
        cogsValue: cogsInfo.totalCost,
        soldQuantity: cogsInfo.quantity
      };
    });

    return PdfGenerator.generateCostReportPdf({
      products: costReportItems,
      totalInventoryValue,
      totalCogs,
      totalItemsCount: products.length,
      periodLabel: label
    });
  }

  /**
   * 3. REPORTE DE GANANCIAS (Margen Bruto y Rentabilidad)
   */
  public static async generateProfitReportPdf(days?: string | number) {
    const { filter, label } = getPeriodFilter(days);

    const approvedOrders = await prisma.order.findMany({
      where: {
        payment: { status: 'APPROVED' },
        ...(filter ? { createdAt: filter } : {})
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const productStats: Record<
      string,
      {
        name: string;
        quantity: number;
        revenue: number;
        cost: number;
      }
    > = {};

    for (const order of approvedOrders) {
      totalRevenue += Number(order.total);
      for (const item of order.items) {
        const itemCost = Number(item.unitCost) * item.quantity;
        const itemRevenue = Number(item.subtotal);
        totalCost += itemCost;

        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            name: item.product?.name || 'Producto',
            quantity: 0,
            revenue: 0,
            cost: 0
          };
        }
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += itemRevenue;
        productStats[item.productId].cost += itemCost;
      }
    }

    const netProfit = totalRevenue - totalCost;
    const profitMarginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const productRows = Object.values(productStats)
      .map((p) => {
        const pProfit = p.revenue - p.cost;
        const pMargin = p.revenue > 0 ? (pProfit / p.revenue) * 100 : 0;
        const avgPrice = p.quantity > 0 ? p.revenue / p.quantity : 0;
        const avgCost = p.quantity > 0 ? p.cost / p.quantity : 0;
        return {
          name: p.name,
          quantity: p.quantity,
          avgPrice,
          avgCost,
          profit: pProfit,
          margin: pMargin
        };
      })
      .sort((a, b) => b.profit - a.profit);

    return PdfGenerator.generateProfitReportPdf({
      products: productRows,
      totalRevenue,
      totalCost,
      netProfit,
      profitMarginPercentage,
      periodLabel: label
    });
  }

  /**
   * 4. REPORTE DE DEMANDAS (Rotación y Días de Cobertura)
   */
  public static async generateDemandReportPdf(days?: string | number) {
    const { filter, label, daysCount } = getPeriodFilter(days);

    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, stock: true },
      orderBy: { name: 'asc' }
    });

    const approvedOrders = await prisma.order.findMany({
      where: {
        payment: { status: 'APPROVED' },
        ...(filter ? { createdAt: filter } : {})
      },
      include: { items: true }
    });

    const soldMap: Record<string, number> = {};
    let totalUnitsSold = 0;

    for (const order of approvedOrders) {
      for (const item of order.items) {
        soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
        totalUnitsSold += item.quantity;
      }
    }

    const effectiveDays = Math.max(1, daysCount);

    const demandRows = products
      .map((p) => {
        const unitsSold = soldMap[p.id] || 0;
        const dailyDemand = unitsSold / effectiveDays;
        const coverageDays =
          dailyDemand > 0 ? Math.round(p.stock / dailyDemand) : p.stock > 0 ? 999 : 0;

        let status = 'Óptimo';
        if (p.stock === 0) {
          status = 'Agotado';
        } else if (dailyDemand > 0 && coverageDays < 7) {
          status = 'Crítico';
        } else if (dailyDemand > 0 && coverageDays < 15) {
          status = 'Alerta';
        } else if (unitsSold === 0 && p.stock > 0) {
          status = 'Sin Demanda';
        }

        return {
          name: p.name,
          stock: p.stock,
          unitsSold,
          dailyDemand: Number(dailyDemand.toFixed(2)),
          coverageDays: coverageDays >= 999 ? '> 1 año' : `${coverageDays} d`,
          status
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold);

    return PdfGenerator.generateDemandReportPdf({
      products: demandRows,
      totalUnitsSold,
      periodDays: effectiveDays,
      periodLabel: label
    });
  }
}
