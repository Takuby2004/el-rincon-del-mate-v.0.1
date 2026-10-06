import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { upload } from '../config/multer';
import { authenticateToken, optionalAuthenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Public routes (con autenticación opcional para distinguir si es admin y mostrar cost o no)
router.get('/', optionalAuthenticateToken, ProductController.getAll);
router.get('/:slug', optionalAuthenticateToken, ProductController.getBySlug);

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.array('images', 8), validateBody(createProductSchema), ProductController.create);
router.put('/:id', authenticateToken, requireAdmin, upload.array('images', 8), validateBody(updateProductSchema), ProductController.update);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.delete);

export default router;
