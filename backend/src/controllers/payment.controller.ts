import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  public static async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { notifyEmail = true } = req.body || {};
      const result = await PaymentService.approvePayment(req.params.id, req.user!.id, notifyEmail);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rejectionReason, notifyEmail = true } = req.body;
      const result = await PaymentService.rejectPayment(req.params.id, rejectionReason, req.user!.id, notifyEmail);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async notifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, message } = req.body || {};
      const result = await PaymentService.notifyPaymentStatusByEmail(req.params.id, status, message);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
