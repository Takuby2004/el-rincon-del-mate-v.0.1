import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { FileStorageService } from '../utils/fileStorageService';

export class CategoryService {
  public static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  public static async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          select: {
            id: true,
            categoryId: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            stock: true,
            imageUrl: true,
            images: true,
            qrCodeUrl: true,
            active: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!category) throw AppError.notFound('Categoría no encontrada');
    return category;
  }

  public static async create(data: { name: string; description?: string; imageUrl?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw AppError.conflict('Ya existe una categoría con este nombre.');

    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
        imageUrl: data.imageUrl || ''
      }
    });
  }

  public static async update(id: string, data: { name?: string; description?: string; imageUrl?: string }) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Categoría no encontrada');

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
      // Si se reemplaza la imagen existente por una nueva, eliminar la imagen anterior del storage
      if (existing.imageUrl && existing.imageUrl !== data.imageUrl) {
        await FileStorageService.deleteFile(existing.imageUrl);
      }
    }

    return prisma.category.update({
      where: { id },
      data: updateData
    });
  }

  public static async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw AppError.notFound('Categoría no encontrada');

    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      throw AppError.conflict(`No se puede eliminar la categoría porque contiene ${productsCount} productos asociados.`);
    }

    const deleted = await prisma.category.delete({ where: { id } });

    // Limpieza de imagen en Supabase Storage / disco local tras eliminar la categoría
    if (category.imageUrl) {
      await FileStorageService.deleteFile(category.imageUrl);
    }

    return deleted;
  }
}
