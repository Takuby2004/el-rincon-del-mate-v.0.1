import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await ProfileService.getProfile(req.user!.id);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const updated = await ProfileService.updateProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
