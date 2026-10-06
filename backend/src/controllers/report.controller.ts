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
      const days = req.query.days as string | undefined;
      const pdfBuffer = await ReportService.generateSalesReportPdf(days);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  public static async downloadCostReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days as string | undefined;
      const pdfBuffer = await ReportService.generateCostReportPdf(days);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-costos-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  public static async downloadProfitReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days as string | undefined;
      const pdfBuffer = await ReportService.generateProfitReportPdf(days);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-ganancias-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  public static async downloadDemandReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days as string | undefined;
      const pdfBuffer = await ReportService.generateDemandReportPdf(days);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-demandas-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
