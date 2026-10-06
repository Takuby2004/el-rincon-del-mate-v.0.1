import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createClientSchema, updateClientSchema } from '../validators/client.validator';

const router = Router();

router.get('/', authenticateToken, requireAdmin, ClientController.getAll);
router.get('/:id', authenticateToken, requireAdmin, ClientController.getById);
router.post('/', authenticateToken, requireAdmin, validateBody(createClientSchema), ClientController.create);
router.put('/:id', authenticateToken, requireAdmin, validateBody(updateClientSchema), ClientController.update);
router.delete('/:id', authenticateToken, requireAdmin, ClientController.delete);

export default router;
