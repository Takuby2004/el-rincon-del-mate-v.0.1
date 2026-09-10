import { Request, Response } from 'express';
import { PaymentQrService } from '../services/paymentQr.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentQrController {
  public static async getActive(req: Request, res: Response) {
    try {
      const activeQr = await PaymentQrService.getActiveQr();
      if (!activeQr) {
        return res.status(444).json({ message: 'No existe un QR de pago configurado actualmente.' });
      }
      res.json(activeQr);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getAll(req: AuthRequest, res: Response) {
    try {
      const configs = await PaymentQrService.getAllQrConfigs();
      res.json(configs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async upload(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Debe adjuntar una imagen del QR (JPG, PNG o WEBP).' });
      }
      const qrConfig = await PaymentQrService.uploadQr(req.file, req.user!.id);
      res.status(201).json(qrConfig);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async deactivate(req: AuthRequest, res: Response) {
    try {
      const updated = await PaymentQrService.deactivateQr(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
