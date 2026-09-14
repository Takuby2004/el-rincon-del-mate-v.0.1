import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { upload } from '../config/multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', ProductController.getAll);
router.get('/:slug', ProductController.getBySlug);

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.array('images', 8), ProductController.create);
router.put('/:id', authenticateToken, requireAdmin, upload.array('images', 8), ProductController.update);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.delete);

export default router;
