import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { rejectPaymentSchema } from '../validators/order.validator';

const router = Router();

router.patch('/admin/payments/:id/approve', authenticateToken, requireAdmin, PaymentController.approve);
router.patch('/admin/payments/:id/reject', authenticateToken, requireAdmin, validateBody(rejectPaymentSchema), PaymentController.reject);
router.post('/admin/payments/:id/notify-email', authenticateToken, requireAdmin, PaymentController.notifyEmail);

export default router;
