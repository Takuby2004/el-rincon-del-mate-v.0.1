import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, ProfileController.getProfile);
router.put('/', authenticateToken, ProfileController.updateProfile);

export default router;
