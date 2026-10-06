import { Request, Response, NextFunction } from 'express';
import { PaymentQrService } from '../services/paymentQr.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';

export class PaymentQrController {
  public static async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const activeQr = await PaymentQrService.getActiveQr();
      if (!activeQr) {
        return res.status(404).json({ error: 'No existe un código QR de pago configurado actualmente.' });
      }
      res.json(activeQr);
    } catch (err) {
      next(err);
    }
  }

  public static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const configs = await PaymentQrService.getAllQrConfigs();
      res.json(configs);
    } catch (err) {
      next(err);
    }
  }

  public static async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw AppError.badRequest('Debe adjuntar una imagen del QR (JPG, PNG o WEBP).');
      }
      const qrConfig = await PaymentQrService.uploadQr(req.file, req.user!.id);
      res.status(201).json(qrConfig);
    } catch (err) {
      next(err);
    }
  }

  public static async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await PaymentQrService.deactivateQr(req.params.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}
