import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { FileStorageService } from '../utils/fileStorageService';
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
      const files = (req.files as Express.Multer.File[]) || [];
      let uploadedUrls: string[] = [];

      if (files.length > 0) {
        const saved = await FileStorageService.saveFiles(files, 'products');
        uploadedUrls = saved.map(s => s.url);
      }

      let images: string[] = [];
      if (req.body.images) {
        images = Array.isArray(req.body.images)
          ? req.body.images
          : (typeof req.body.images === 'string' && req.body.images.startsWith('[')
              ? JSON.parse(req.body.images)
              : [req.body.images]);
      }
      images = [...images, ...uploadedUrls];

      const product = await ProductService.create({
        categoryId: req.body.categoryId,
        name: req.body.name,
        description: req.body.description || '',
        price: Number(req.body.price),
        cost: Number(req.body.cost || 0),
        stock: Number(req.body.stock || 0),
        imageUrl: images[0] || req.body.imageUrl || '',
        images: images,
        userId: req.user?.id
      });
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async update(req: AuthRequest, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      let uploadedUrls: string[] = [];

      if (files.length > 0) {
        const saved = await FileStorageService.saveFiles(files, 'products');
        uploadedUrls = saved.map(s => s.url);
      }

      let existingImages: string[] = [];
      if (req.body.existingImages) {
        try {
          existingImages = typeof req.body.existingImages === 'string'
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        } catch {
          existingImages = [req.body.existingImages];
        }
      } else if (req.body.images) {
        try {
          existingImages = typeof req.body.images === 'string'
            ? JSON.parse(req.body.images)
            : req.body.images;
        } catch {
          existingImages = [req.body.images];
        }
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const updatePayload: any = {
        userId: req.user?.id
      };

      if (req.body.name !== undefined) updatePayload.name = req.body.name;
      if (req.body.categoryId !== undefined) updatePayload.categoryId = req.body.categoryId;
      if (req.body.description !== undefined) updatePayload.description = req.body.description;
      if (req.body.price !== undefined) updatePayload.price = Number(req.body.price);
      if (req.body.cost !== undefined) updatePayload.cost = Number(req.body.cost);
      if (req.body.stockAdjustment !== undefined) updatePayload.stockAdjustment = Number(req.body.stockAdjustment);
      if (req.body.active !== undefined) updatePayload.active = req.body.active === 'true' || req.body.active === true;

      if (allImages.length > 0 || files.length > 0 || req.body.existingImages !== undefined) {
        updatePayload.images = allImages;
        updatePayload.imageUrl = allImages[0] || '';
      } else if (req.body.imageUrl !== undefined) {
        updatePayload.imageUrl = req.body.imageUrl;
      }

      const product = await ProductService.update(req.params.id, updatePayload);
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
