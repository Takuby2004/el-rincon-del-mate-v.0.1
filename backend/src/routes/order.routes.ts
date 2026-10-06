import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { upload } from '../config/multer';
import { authenticateToken, optionalAuthenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Create order with payment proof (Public or Client)
router.post('/', upload.single('paymentProof'), OrderController.create);

// Get single order (Public con DTO protegido o Admin con vista completa)
router.get('/:id', optionalAuthenticateToken, OrderController.getById);

// Admin order management
router.get('/', authenticateToken, requireAdmin, OrderController.getAll);
router.patch('/:id/status', authenticateToken, requireAdmin, validateBody(updateOrderStatusSchema), OrderController.updateStatus);
router.delete('/:id', authenticateToken, requireAdmin, OrderController.delete);

export default router;
