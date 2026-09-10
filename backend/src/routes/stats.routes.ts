import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, StatsController.getDashboardStats);

export default router;
