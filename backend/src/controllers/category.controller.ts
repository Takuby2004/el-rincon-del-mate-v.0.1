import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  public static async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAll();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getBySlug(req: Request, res: Response) {
    try {
      const category = await CategoryService.getBySlug(req.params.slug);
      res.json(category);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      res.json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await CategoryService.delete(req.params.id);
      res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
