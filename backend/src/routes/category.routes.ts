import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin routes
router.post('/', authenticateToken, requireAdmin, CategoryController.create);
router.put('/:id', authenticateToken, requireAdmin, CategoryController.update);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.delete);

export default router;
