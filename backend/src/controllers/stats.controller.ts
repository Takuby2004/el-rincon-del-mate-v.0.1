import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  public static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedDays = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const days = !isNaN(parsedDays) && parsedDays > 0 ? parsedDays : 7;
      const stats = await StatsService.getDashboardStats(days);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
