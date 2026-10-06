import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { FileStorageService } from '../utils/fileStorageService';

export class CategoryController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  public static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getBySlug(req.params.slug);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      let imageUrl = req.body.imageUrl || '';
      if (req.file) {
        const saved = await FileStorageService.saveFile(req.file, 'categories');
        imageUrl = saved.url;
      }

      const category = await CategoryService.create({
        name: req.body.name,
        description: req.body.description || '',
        imageUrl
      });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updatePayload: any = {};
      if (req.body.name !== undefined) updatePayload.name = req.body.name;
      if (req.body.description !== undefined) updatePayload.description = req.body.description;

      if (req.file) {
        const saved = await FileStorageService.saveFile(req.file, 'categories');
        updatePayload.imageUrl = saved.url;
      } else if (req.body.imageUrl !== undefined) {
        updatePayload.imageUrl = req.body.imageUrl;
      }

      const category = await CategoryService.update(req.params.id, updatePayload);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.delete(req.params.id);
      res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}
