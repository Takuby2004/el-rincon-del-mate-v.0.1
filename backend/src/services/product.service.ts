import { prisma } from '../config/prisma';
import { QrGenerator } from '../utils/qrGenerator';
import { AppError } from '../errors/AppError';
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class ProductService {
  public static async getAll(
    filters?: {
      categoryId?: string;
      search?: string;
      activeOnly?: boolean;
      page?: string | number;
      pageSize?: string | number;
    },
    isAdmin: boolean = false
  ) {
    const where: any = {};
    if (filters?.activeOnly) {
      where.active = true;
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const { page, pageSize, skip, take, isPaginated } = parsePaginationParams(filters || {});
    const total = await prisma.product.count({ where });

    let products;
    if (isAdmin) {
      products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: isPaginated ? skip : undefined,
        take: isPaginated ? take : undefined
      });
    } else {
      products = await prisma.product.findMany({
        where,
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
          updatedAt: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip: isPaginated ? skip : undefined,
        take: isPaginated ? take : undefined
      });
    }

    const formatProduct = (p: any) => ({
      ...p,
      price: Number(p.price),
      ...(p.cost !== undefined && p.cost !== null ? { cost: Number(p.cost) } : {})
    });

    const formatted = products.map(formatProduct);

    if (isPaginated) {
      return buildPaginatedResponse(formatted, total, page, pageSize);
    }
    return formatted;
  }

  public static async getBySlug(slug: string, isAdmin: boolean = false) {
    let product;
    if (isAdmin) {
      product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true }
      });
      if (!product) throw AppError.notFound('Producto no encontrado');
    } else {
      // P0-2: Excluir cost en consulta pública
      product = await prisma.product.findUnique({
        where: { slug },
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
          updatedAt: true,
          category: true
        }
      });
      if (!product) throw AppError.notFound('Producto no encontrado');
    }

    const rawCost = (product as any).cost;
    return {
      ...product,
      price: Number(product.price),
      ...(rawCost !== undefined && rawCost !== null ? { cost: Number(rawCost) } : {})
    };
  }

  public static async create(data: {
    categoryId: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    stock: number;
    imageUrl?: string;
    images?: string[];
    userId?: string;
  }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw AppError.conflict('Ya existe un producto con un nombre similar.');

    const qrText = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/productos/${slug}`;
    const qrCodeUrl = await QrGenerator.generateDataUrl(qrText);

    const imagesList = data.images || (data.imageUrl ? [data.imageUrl] : []);
    const primaryImage = data.imageUrl || (imagesList.length > 0 ? imagesList[0] : '');

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug,
          description: data.description,
          price: Number(data.price),
          cost: Number(data.cost || 0),
          stock: Number(data.stock || 0),
          imageUrl: primaryImage,
          images: imagesList,
          qrCodeUrl
        },
        include: { category: true }
      });

      if (data.stock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            userId: data.userId,
            type: 'INITIAL',
            quantity: Number(data.stock),
            reason: 'Stock inicial de producto'
          }
        });
      }

      return product;
    });
  }

  public static async update(
    id: string,
    data: {
      categoryId?: string;
      name?: string;
      description?: string;
      price?: number;
      cost?: number;
      stockAdjustment?: number;
      imageUrl?: string;
      images?: string[];
      active?: boolean;
      userId?: string;
    }
  ) {
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) throw AppError.notFound('Producto no encontrado');

    const updateData: any = {};
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.cost !== undefined) updateData.cost = Number(data.cost);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    if (data.name && data.name !== currentProduct.name) {
      updateData.name = data.name;
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const qrText = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/productos/${updateData.slug}`;
      updateData.qrCodeUrl = await QrGenerator.generateDataUrl(qrText);
    }

    return prisma.$transaction(async (tx) => {
      if (data.stockAdjustment && data.stockAdjustment !== 0) {
        const newStock = currentProduct.stock + data.stockAdjustment;
        if (newStock < 0) throw AppError.badRequest('El ajuste de stock no puede dejar el stock total en negativo.');

        updateData.stock = newStock;

        await tx.inventoryMovement.create({
          data: {
            productId: id,
            userId: data.userId,
            type: data.stockAdjustment > 0 ? 'RESTOCK' : 'ADJUSTMENT',
            quantity: data.stockAdjustment,
            reason: data.stockAdjustment > 0 ? 'Reabastecimiento de inventario' : 'Ajuste manual de inventario'
          }
        });
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: { category: true }
      });
    });
  }

  public static async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw AppError.notFound('Producto no encontrado');

    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      throw AppError.conflict(
        `No se puede eliminar el producto porque está asociado a ${orderItemsCount} pedido(s) registrado(s). Para ocultarlo del catálogo, desactívalo desde la edición.`
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.inventoryMovement.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }
}
