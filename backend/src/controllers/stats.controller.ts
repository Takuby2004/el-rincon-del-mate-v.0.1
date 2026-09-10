import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  public static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await StatsService.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
