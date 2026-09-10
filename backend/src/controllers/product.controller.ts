import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProductController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { categoryId, search, activeOnly } = req.query;
      const products = await ProductService.getAll({
        categoryId: categoryId as string,
        search: search as string,
        activeOnly: activeOnly === 'true'
      });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getBySlug(req: Request, res: Response) {
    try {
      const product = await ProductService.getBySlug(req.params.slug);
      res.json(product);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  public static async create(req: AuthRequest, res: Response) {
    try {
      const product = await ProductService.create({
        ...req.body,
        userId: req.user?.id
      });
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async update(req: AuthRequest, res: Response) {
    try {
      const product = await ProductService.update(req.params.id, {
        ...req.body,
        userId: req.user?.id
      });
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await ProductService.delete(req.params.id);
      res.json({ message: 'Producto desactivado correctamente.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
