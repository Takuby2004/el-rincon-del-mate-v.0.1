import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createOrderBodySchema } from '../validators/order.validator';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export class OrderController {
  public static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw AppError.badRequest('El comprobante de pago en formato imagen es obligatorio.');
      }

      let parsedOrderData;
      if (typeof req.body.orderData === 'string') {
        try {
          parsedOrderData = JSON.parse(req.body.orderData);
        } catch {
          throw AppError.badRequest('El formato de los datos del pedido no es un JSON válido.');
        }
      } else {
        parsedOrderData = req.body;
      }

      const validatedData = createOrderBodySchema.parse(parsedOrderData);
      const order = await OrderService.createOrder(validatedData, req.file, req.user?.id);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, paymentStatus, search, page, pageSize } = req.query;
      const orders = await OrderService.getAllOrders({
        status: status as string,
        paymentStatus: paymentStatus as string,
        search: search as string,
        page: page as string,
        pageSize: pageSize as string
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const order = await OrderService.getOrderById(req.params.id, isAdmin);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await OrderService.updateOrderStatus(req.params.id, status, req.user?.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.deleteOrder(req.params.id, req.user?.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
