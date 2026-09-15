import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { upload } from '../config/multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), CategoryController.create);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), CategoryController.update);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.delete);

export default router;
