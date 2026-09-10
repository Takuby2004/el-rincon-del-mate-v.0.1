import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  public static async downloadOrderPdf(req: Request, res: Response) {
    try {
      const pdfBuffer = await ReportService.generateOrderPdf(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido-${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async downloadSalesReportPdf(req: Request, res: Response) {
    try {
      const pdfBuffer = await ReportService.generateSalesReportPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
