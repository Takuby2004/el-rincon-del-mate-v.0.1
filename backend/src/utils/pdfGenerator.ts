import PDFDocument from 'pdfkit';

export class PdfGenerator {
  /**
   * Genera el comprobante individual de un pedido en PDF (Orientación Vertical A4).
   */
  public static generateOrderPdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#1b4332').fontSize(20).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#2d6a4f').fontSize(12).text('Comprobante de Pedido', { align: 'center' });
        doc.moveDown(1.5);

        // Order Info
        doc.fillColor('#000000').fontSize(10);
        doc.text(`Número de Pedido: ${order.orderNumber}`);
        doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString('es-BO')}`);
        doc.text(`Estado del Pedido: ${order.status}`);
        doc.text(`Estado del Pago: ${order.paymentStatus}`);
        doc.moveDown();

        // Client Info
        doc.fillColor('#1b4332').fontSize(12).text('Datos del Cliente');
        doc.fillColor('#000000').fontSize(10);
        doc.text(`Nombre: ${order.client?.name || 'N/A'}`);
        doc.text(`Email: ${order.client?.email || 'N/A'}`);
        doc.text(`Teléfono: ${order.client?.phone || 'N/A'}`);
        doc.text(`Dirección de Envío: ${order.address}, ${order.city}`);
        if (order.client?.ciNit) doc.text(`CI/NIT: ${order.client.ciNit}`);
        doc.moveDown(1.5);

        // Items Table
        doc.fillColor('#1b4332').fontSize(12).text('Detalle de Productos');
        doc.moveDown(0.5);

        let y = doc.y;
        doc.fillColor('#40916c').fontSize(10);
        doc.text('Producto', 50, y);
        doc.text('Cant.', 300, y);
        doc.text('P. Unit', 370, y);
        doc.text('Subtotal', 470, y);

        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke('#d8f3dc');
        y += 20;

        doc.fillColor('#000000').fontSize(10);
        order.items.forEach((item: any) => {
          doc.text(item.product?.name || 'Producto', 50, y, { width: 240 });
          doc.text(item.quantity.toString(), 300, y);
          doc.text(`Bs. ${item.unitPrice.toFixed(2)}`, 370, y);
          doc.text(`Bs. ${item.subtotal.toFixed(2)}`, 470, y);
          y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke('#d8f3dc');
        y += 10;

        doc.fillColor('#1b4332').fontSize(12).text(`Total: Bs. ${order.total.toFixed(2)}`, 400, y, { align: 'right' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 1. REPORTE DE VENTAS (Pagos Aprobados) - Orientación Horizontal A4 (Landscape)
   */
  public static generateSalesReportPdf(
    salesData: any[],
    totalSales: number,
    totalOrders: number,
    periodLabel: string = 'Todo el Histórico'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#1b4332').fontSize(22).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#2d6a4f').fontSize(13).text('Reporte Oficial de Ventas (Pagos Aprobados)', { align: 'center' });
        doc.fillColor('#666666').fontSize(10).text(`Período Auditado: ${periodLabel}`, { align: 'center' });
        doc.moveDown(1);

        // Tarjeta de Resumen Ejecutivo (Ancho completo: 760 pt)
        const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
        doc.rect(40, doc.y, 760, 65).fillAndStroke('#f0fdf4', '#86efac');
        const boxY = doc.y + 10;

        doc.fillColor('#166534').fontSize(9).text('TOTAL INGRESOS', 60, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`Bs. ${totalSales.toFixed(2)}`, 60, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('PEDIDOS APROBADOS', 320, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`${totalOrders}`, 320, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('TICKET PROMEDIO (AOV)', 570, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`Bs. ${aov.toFixed(2)}`, 570, boxY + 14);

        doc.font('Helvetica');
        doc.fillColor('#555555').fontSize(8).text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, 60, boxY + 38);

        doc.y = boxY + 70;
        doc.moveDown(1);

        // Tabla de Ventas en Horizontal (Ancho total: 760 pt sin colisiones)
        let y = doc.y;
        doc.fillColor('#1b4332').fontSize(9.5).font('Helvetica-Bold');
        doc.text('Nº Pedido', 40, y, { width: 180 });
        doc.text('Cliente', 230, y, { width: 200 });
        doc.text('Fecha', 440, y, { width: 90 });
        doc.text('Ciudad', 540, y, { width: 140 });
        doc.text('Monto Total', 690, y, { align: 'right', width: 110 });

        doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#bbf7d0');
        y += 22;

        doc.font('Helvetica').fontSize(9).fillColor('#111827');
        if (salesData.length === 0) {
          doc.fillColor('#666666').text('No se encontraron ventas aprobadas en el período seleccionado.', 40, y);
        } else {
          salesData.forEach((order: any) => {
            doc.text(order.orderNumber, 40, y, { width: 180 });
            doc.text(order.client?.name || 'Consumidor Final', 230, y, { width: 200 });
            doc.text(new Date(order.createdAt).toLocaleDateString('es-BO'), 440, y, { width: 90 });
            doc.text(order.city || 'Santa Cruz', 540, y, { width: 140 });
            doc.text(`Bs. ${Number(order.total).toFixed(2)}`, 690, y, { align: 'right', width: 110 });
            y += 20;

            // Salto de página para orientación horizontal (altura total 595 pt)
            if (y > 510) {
              doc.addPage();
              y = 45;
              // Repetir cabecera de tabla en nueva página
              doc.fillColor('#1b4332').fontSize(9.5).font('Helvetica-Bold');
              doc.text('Nº Pedido', 40, y, { width: 180 });
              doc.text('Cliente', 230, y, { width: 200 });
              doc.text('Fecha', 440, y, { width: 90 });
              doc.text('Ciudad', 540, y, { width: 140 });
              doc.text('Monto Total', 690, y, { align: 'right', width: 110 });
              doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#bbf7d0');
              y += 22;
              doc.font('Helvetica').fontSize(9).fillColor('#111827');
            }
          });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 2. REPORTE DE COSTOS (COGS y Valuación de Inventario) - Orientación Horizontal A4 (Landscape)
   */
  public static generateCostReportPdf(data: {
    products: any[];
    totalInventoryValue: number;
    totalCogs: number;
    totalItemsCount: number;
    periodLabel: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#7c2d12').fontSize(22).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#9a3412').fontSize(13).text('Reporte Oficial de Costos y Valuación de Inventario', { align: 'center' });
        doc.fillColor('#666666').fontSize(10).text(`Período Auditado: ${data.periodLabel}`, { align: 'center' });
        doc.moveDown(1);

        // Tarjeta de Resumen Ejecutivo (Ancho: 760 pt)
        doc.rect(40, doc.y, 760, 65).fillAndStroke('#fff7ed', '#fed7aa');
        const boxY = doc.y + 10;

        doc.fillColor('#9a3412').fontSize(9).text('COSTO BIENES VENDIDOS (COGS)', 60, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`Bs. ${data.totalCogs.toFixed(2)}`, 60, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('VALORACIÓN EN BODEGA', 320, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`Bs. ${data.totalInventoryValue.toFixed(2)}`, 320, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('PRODUCTOS EN CATÁLOGO', 570, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`${data.totalItemsCount}`, 570, boxY + 14);

        doc.font('Helvetica');
        doc.fillColor('#555555').fontSize(8).text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, 60, boxY + 38);

        doc.y = boxY + 70;
        doc.moveDown(1);

        // Tabla de Costos en Horizontal
        let y = doc.y;
        doc.fillColor('#7c2d12').fontSize(9.5).font('Helvetica-Bold');
        doc.text('Producto', 40, y, { width: 220 });
        doc.text('Categoría', 270, y, { width: 120 });
        doc.text('Stock', 400, y, { align: 'right', width: 60 });
        doc.text('Costo Unit.', 470, y, { align: 'right', width: 80 });
        doc.text('Val. Stock', 560, y, { align: 'right', width: 110 });
        doc.text('COGS Período', 680, y, { align: 'right', width: 120 });

        doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#fed7aa');
        y += 22;

        doc.font('Helvetica').fontSize(9).fillColor('#111827');
        data.products.forEach((p: any) => {
          doc.text(p.name, 40, y, { width: 220 });
          doc.text(p.categoryName, 270, y, { width: 120 });
          doc.text(`${p.stock}`, 400, y, { align: 'right', width: 60 });
          doc.text(`Bs. ${p.unitCost.toFixed(2)}`, 470, y, { align: 'right', width: 80 });
          doc.text(`Bs. ${p.stockValue.toFixed(2)}`, 560, y, { align: 'right', width: 110 });
          doc.text(`Bs. ${p.cogsValue.toFixed(2)}`, 680, y, { align: 'right', width: 120 });
          y += 19;

          if (y > 510) {
            doc.addPage();
            y = 45;
            doc.fillColor('#7c2d12').fontSize(9.5).font('Helvetica-Bold');
            doc.text('Producto', 40, y, { width: 220 });
            doc.text('Categoría', 270, y, { width: 120 });
            doc.text('Stock', 400, y, { align: 'right', width: 60 });
            doc.text('Costo Unit.', 470, y, { align: 'right', width: 80 });
            doc.text('Val. Stock', 560, y, { align: 'right', width: 110 });
            doc.text('COGS Período', 680, y, { align: 'right', width: 120 });
            doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#fed7aa');
            y += 22;
            doc.font('Helvetica').fontSize(9).fillColor('#111827');
          }
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 3. REPORTE DE GANANCIAS (Margen Bruto y Rentabilidad) - Orientación Horizontal A4 (Landscape)
   */
  public static generateProfitReportPdf(data: {
    products: any[];
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    profitMarginPercentage: number;
    periodLabel: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#312e81').fontSize(22).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#4338ca').fontSize(13).text('Reporte Oficial de Ganancias y Rentabilidad Neta', { align: 'center' });
        doc.fillColor('#666666').fontSize(10).text(`Período Auditado: ${data.periodLabel}`, { align: 'center' });
        doc.moveDown(1);

        // Tarjeta de Resumen Financiero (Ancho: 760 pt)
        doc.rect(40, doc.y, 760, 65).fillAndStroke('#eef2ff', '#c7d2fe');
        const boxY = doc.y + 10;

        doc.fillColor('#3730a3').fontSize(9).text('INGRESOS TOTALES', 60, boxY);
        doc.fontSize(14).font('Helvetica-Bold').text(`Bs. ${data.totalRevenue.toFixed(2)}`, 60, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('COSTO ASOCIADO', 240, boxY);
        doc.fontSize(14).font('Helvetica-Bold').text(`Bs. ${data.totalCost.toFixed(2)}`, 240, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('GANANCIA NETA', 430, boxY);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(data.netProfit >= 0 ? '#15803d' : '#b91c1c').text(`Bs. ${data.netProfit.toFixed(2)}`, 430, boxY + 14);

        doc.fillColor('#3730a3').font('Helvetica').fontSize(9).text('MARGEN NETO', 620, boxY);
        doc.fontSize(14).font('Helvetica-Bold').text(`${data.profitMarginPercentage.toFixed(1)}%`, 620, boxY + 14);

        doc.font('Helvetica');
        doc.fillColor('#555555').fontSize(8).text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, 60, boxY + 38);

        doc.y = boxY + 70;
        doc.moveDown(1);

        // Tabla de Rentabilidad por Producto en Horizontal
        let y = doc.y;
        doc.fillColor('#312e81').fontSize(9.5).font('Helvetica-Bold');
        doc.text('Producto', 40, y, { width: 230 });
        doc.text('Cant. Vend.', 280, y, { align: 'right', width: 80 });
        doc.text('P. Venta Prom.', 370, y, { align: 'right', width: 100 });
        doc.text('Costo Unit.', 480, y, { align: 'right', width: 90 });
        doc.text('Ganancia Total', 580, y, { align: 'right', width: 110 });
        doc.text('Margen %', 700, y, { align: 'right', width: 100 });

        doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#c7d2fe');
        y += 22;

        doc.font('Helvetica').fontSize(9).fillColor('#111827');
        if (data.products.length === 0) {
          doc.fillColor('#666666').text('No se registraron ventas en el período para calcular rentabilidad.', 40, y);
        } else {
          data.products.forEach((p: any) => {
            doc.text(p.name, 40, y, { width: 230 });
            doc.text(`${p.quantity}`, 280, y, { align: 'right', width: 80 });
            doc.text(`Bs. ${p.avgPrice.toFixed(2)}`, 370, y, { align: 'right', width: 100 });
            doc.text(`Bs. ${p.avgCost.toFixed(2)}`, 480, y, { align: 'right', width: 90 });
            doc.fillColor(p.profit >= 0 ? '#15803d' : '#b91c1c').text(`Bs. ${p.profit.toFixed(2)}`, 580, y, { align: 'right', width: 110 });
            doc.fillColor('#111827').text(`${p.margin.toFixed(1)}%`, 700, y, { align: 'right', width: 100 });
            y += 19;

            if (y > 510) {
              doc.addPage();
              y = 45;
              doc.fillColor('#312e81').fontSize(9.5).font('Helvetica-Bold');
              doc.text('Producto', 40, y, { width: 230 });
              doc.text('Cant. Vend.', 280, y, { align: 'right', width: 80 });
              doc.text('P. Venta Prom.', 370, y, { align: 'right', width: 100 });
              doc.text('Costo Unit.', 480, y, { align: 'right', width: 90 });
              doc.text('Ganancia Total', 580, y, { align: 'right', width: 110 });
              doc.text('Margen %', 700, y, { align: 'right', width: 100 });
              doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#c7d2fe');
              y += 22;
              doc.font('Helvetica').fontSize(9).fillColor('#111827');
            }
          });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 4. REPORTE DE DEMANDAS (Rotación y Días de Cobertura) - Orientación Horizontal A4 (Landscape)
   */
  public static generateDemandReportPdf(data: {
    products: any[];
    totalUnitsSold: number;
    periodDays: number;
    periodLabel: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#0e7490').fontSize(22).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#0891b2').fontSize(13).text('Reporte Oficial de Demanda y Rotación de Stock', { align: 'center' });
        doc.fillColor('#666666').fontSize(10).text(`Período Auditado: ${data.periodLabel}`, { align: 'center' });
        doc.moveDown(1);

        // Tarjeta de Resumen Ejecutivo (Ancho: 760 pt)
        const criticalCount = data.products.filter((p: any) => p.status === 'Crítico' || p.status === 'Agotado').length;
        doc.rect(40, doc.y, 760, 65).fillAndStroke('#ecfeff', '#a5f3fc');
        const boxY = doc.y + 10;

        doc.fillColor('#0e7490').fontSize(9).text('UNIDADES VENDIDAS', 60, boxY);
        doc.fontSize(15).font('Helvetica-Bold').text(`${data.totalUnitsSold} uds`, 60, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('DEMANDA DIARIA CATÁLOGO', 310, boxY);
        const avgDailyCatalog = data.totalUnitsSold / Math.max(1, data.periodDays);
        doc.fontSize(15).font('Helvetica-Bold').text(`${avgDailyCatalog.toFixed(1)} uds/día`, 310, boxY + 14);

        doc.font('Helvetica').fontSize(9).text('PRODUCTOS EN ALERTA / AGOTADOS', 560, boxY);
        doc.fontSize(15).font('Helvetica-Bold').fillColor(criticalCount > 0 ? '#b91c1c' : '#0e7490').text(`${criticalCount}`, 560, boxY + 14);

        doc.font('Helvetica');
        doc.fillColor('#555555').fontSize(8).text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, 60, boxY + 38);

        doc.y = boxY + 70;
        doc.moveDown(1);

        // Tabla de Demanda en Horizontal
        let y = doc.y;
        doc.fillColor('#0e7490').fontSize(9.5).font('Helvetica-Bold');
        doc.text('Producto', 40, y, { width: 230 });
        doc.text('Stock Actual', 280, y, { align: 'right', width: 70 });
        doc.text('Vendidos', 360, y, { align: 'right', width: 70 });
        doc.text('Demanda/Día', 440, y, { align: 'right', width: 100 });
        doc.text('Cobertura', 550, y, { align: 'right', width: 110 });
        doc.text('Estado Stock', 670, y, { align: 'center', width: 130 });

        doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#a5f3fc');
        y += 22;

        doc.font('Helvetica').fontSize(9).fillColor('#111827');
        data.products.forEach((p: any) => {
          doc.text(p.name, 40, y, { width: 230 });
          doc.text(`${p.stock}`, 280, y, { align: 'right', width: 70 });
          doc.text(`${p.unitsSold}`, 360, y, { align: 'right', width: 70 });
          doc.text(`${p.dailyDemand.toFixed(1)}/d`, 440, y, { align: 'right', width: 100 });
          doc.text(`${p.coverageDays}`, 550, y, { align: 'right', width: 110 });

          // Color del estado
          if (p.status === 'Crítico' || p.status === 'Agotado') {
            doc.fillColor('#b91c1c');
          } else if (p.status === 'Alerta') {
            doc.fillColor('#b45309');
          } else if (p.status === 'Sin Demanda') {
            doc.fillColor('#64748b');
          } else {
            doc.fillColor('#15803d');
          }

          doc.text(p.status, 670, y, { align: 'center', width: 130 });
          doc.fillColor('#111827');
          y += 19;

          if (y > 510) {
            doc.addPage();
            y = 45;
            doc.fillColor('#0e7490').fontSize(9.5).font('Helvetica-Bold');
            doc.text('Producto', 40, y, { width: 230 });
            doc.text('Stock Actual', 280, y, { align: 'right', width: 70 });
            doc.text('Vendidos', 360, y, { align: 'right', width: 70 });
            doc.text('Demanda/Día', 440, y, { align: 'right', width: 100 });
            doc.text('Cobertura', 550, y, { align: 'right', width: 110 });
            doc.text('Estado Stock', 670, y, { align: 'center', width: 130 });
            doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke('#a5f3fc');
            y += 22;
            doc.font('Helvetica').fontSize(9).fillColor('#111827');
          }
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
