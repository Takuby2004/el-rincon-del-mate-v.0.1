import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { upload } from '../config/multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Create order with payment proof (Public or Client)
router.post('/', upload.single('paymentProof'), OrderController.create);

// Get single order (Public or Admin)
router.get('/:id', OrderController.getById);

// Admin order management
router.get('/', authenticateToken, requireAdmin, OrderController.getAll);
router.patch('/:id/status', authenticateToken, requireAdmin, OrderController.updateStatus);
router.delete('/:id', authenticateToken, requireAdmin, OrderController.delete);

export default router;
