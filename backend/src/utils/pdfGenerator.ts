import PDFDocument from 'pdfkit';

export class PdfGenerator {
  public static generateOrderPdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
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

  public static generateSalesReportPdf(salesData: any[], totalSales: number, totalOrders: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#1b4332').fontSize(20).text('EL RINCÓN DEL MATE', { align: 'center' });
        doc.fillColor('#2d6a4f').fontSize(12).text('Reporte Oficial de Ventas (Pagos Aprobados)', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10).fillColor('#333333');
        doc.text(`Fecha de Generación: ${new Date().toLocaleString('es-BO')}`);
        doc.text(`Total de Pedidos Pagados: ${totalOrders}`);
        doc.text(`Ingresos Totales Registrados: Bs. ${totalSales.toFixed(2)}`);
        doc.moveDown(1.5);

        // Table
        let y = doc.y;
        doc.fillColor('#1b4332').fontSize(10);
        doc.text('Nº Pedido', 50, y);
        doc.text('Cliente', 130, y);
        doc.text('Fecha', 280, y);
        doc.text('Monto Total', 450, y);

        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke('#d8f3dc');
        y += 20;

        doc.fillColor('#000000');
        salesData.forEach((order: any) => {
          doc.text(order.orderNumber, 50, y);
          doc.text(order.client?.name || 'Cliente', 130, y, { width: 140 });
          doc.text(new Date(order.createdAt).toLocaleDateString('es-BO'), 280, y);
          doc.text(`Bs. ${order.total.toFixed(2)}`, 450, y);
          y += 20;

          if (y > 700) {
            doc.addPage();
            y = 50;
          }
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
