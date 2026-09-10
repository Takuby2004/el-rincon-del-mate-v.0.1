import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}
