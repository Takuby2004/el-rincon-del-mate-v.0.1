import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/orders/:id/pdf', ReportController.downloadOrderPdf);
router.get('/sales/pdf', authenticateToken, requireAdmin, ReportController.downloadSalesReportPdf);

export default router;
