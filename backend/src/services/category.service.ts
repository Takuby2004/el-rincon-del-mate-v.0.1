import { prisma } from '../config/prisma';

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
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!category) throw new Error('Categoría no encontrada');
    return category;
  }

  public static async create(data: { name: string; description?: string; imageUrl?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new Error('Ya existe una categoría con este nombre.');

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
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    return prisma.category.update({
      where: { id },
      data: updateData
    });
  }

  public static async delete(id: string) {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque contiene ${productsCount} productos asociados.`);
    }
    return prisma.category.delete({ where: { id } });
  }
}
