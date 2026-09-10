import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.patch('/admin/payments/:id/approve', authenticateToken, requireAdmin, PaymentController.approve);
router.patch('/admin/payments/:id/reject', authenticateToken, requireAdmin, PaymentController.reject);

export default router;
