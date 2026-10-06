import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { upload } from '../config/multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), validateBody(createCategorySchema), CategoryController.create);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), validateBody(updateCategorySchema), CategoryController.update);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.delete);

export default router;
