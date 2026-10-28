import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Comprobante de pedido individual (Solo administradores o cliente propietario del pedido)
router.get('/orders/:id/pdf', authenticateToken, ReportController.downloadOrderPdf);

// Reportes ejecutivos administrativos
router.get('/sales/pdf', authenticateToken, requireAdmin, ReportController.downloadSalesReportPdf);
router.get('/costs/pdf', authenticateToken, requireAdmin, ReportController.downloadCostReportPdf);
router.get('/profits/pdf', authenticateToken, requireAdmin, ReportController.downloadProfitReportPdf);
router.get('/demand/pdf', authenticateToken, requireAdmin, ReportController.downloadDemandReportPdf);

export default router;
