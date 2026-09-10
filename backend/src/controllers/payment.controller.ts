import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  public static async approve(req: AuthRequest, res: Response) {
    try {
      const result = await PaymentService.approvePayment(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async reject(req: AuthRequest, res: Response) {
    try {
      const { rejectionReason } = req.body;
      const result = await PaymentService.rejectPayment(req.params.id, rejectionReason, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
