import { Router } from 'express';
import { PaymentQrController } from '../controllers/paymentQr.controller';
import { upload } from '../config/multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint
router.get('/', PaymentQrController.getActive);

// Admin endpoints
router.get('/admin', authenticateToken, requireAdmin, PaymentQrController.getAll);
router.post('/admin', authenticateToken, requireAdmin, upload.single('qrImage'), PaymentQrController.upload);
router.delete('/admin/:id', authenticateToken, requireAdmin, PaymentQrController.deactivate);

export default router;
