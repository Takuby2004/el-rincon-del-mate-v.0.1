import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  public static async downloadOrderPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfBuffer = await ReportService.generateOrderPdf(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido-${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  public static async downloadSalesReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfBuffer = await ReportService.generateSalesReportPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
