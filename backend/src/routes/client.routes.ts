import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, ClientController.getAll);
router.get('/:id', authenticateToken, requireAdmin, ClientController.getById);
router.post('/', authenticateToken, requireAdmin, ClientController.create);
router.put('/:id', authenticateToken, requireAdmin, ClientController.update);
router.delete('/:id', authenticateToken, requireAdmin, ClientController.delete);

export default router;
