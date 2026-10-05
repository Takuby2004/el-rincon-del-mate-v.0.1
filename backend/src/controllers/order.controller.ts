import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class OrderController {
  public static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'El comprobante de pago en formato imagen es obligatorio.' });
      }

      let parsedOrderData;
      if (typeof req.body.orderData === 'string') {
        parsedOrderData = JSON.parse(req.body.orderData);
      } else {
        parsedOrderData = req.body;
      }

      const order = await OrderService.createOrder(parsedOrderData, req.file, req.user?.id);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const { status, paymentStatus, search } = req.query;
      const orders = await OrderService.getAllOrders({
        status: status as string,
        paymentStatus: paymentStatus as string,
        search: search as string
      });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const updated = await OrderService.updateOrderStatus(req.params.id, status);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async delete(req: AuthRequest, res: Response) {
    try {
      const result = await OrderService.deleteOrder(req.params.id, req.user?.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
