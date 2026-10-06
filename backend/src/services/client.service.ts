import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { parsePaginationParams, buildPaginatedResponse, PaginationQuery } from '../utils/pagination';

export class ClientService {
  public static async getAllClients(query?: PaginationQuery) {
    const { page, pageSize, skip, take, isPaginated } = parsePaginationParams(query || {});
    const total = await prisma.client.count();

    const clients = await prisma.client.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: isPaginated ? skip : undefined,
      take: isPaginated ? take : undefined
    });

    if (isPaginated) {
      return buildPaginatedResponse(clients, total, page, pageSize);
    }
    return clients;
  }

  public static async getClientById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { payment: true }
        }
      }
    });
    if (!client) throw AppError.notFound('Cliente no encontrado');
    return client;
  }

  public static async createClient(data: { name: string; email: string; phone: string; address: string; city?: string; ciNit?: string }) {
    return prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city || 'Santa Cruz',
        ciNit: data.ciNit || ''
      }
    });
  }

  public static async updateClient(id: string, data: { name?: string; email?: string; phone?: string; address?: string; city?: string; ciNit?: string }) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Cliente no encontrado');

    return prisma.client.update({
      where: { id },
      data
    });
  }

  public static async deleteClient(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!client) {
      throw AppError.notFound('El cliente no existe o ya fue eliminado.');
    }

    if (client._count.orders > 0) {
      throw AppError.conflict(
        `No es posible eliminar a "${client.name}" porque cuenta con ${client._count.orders} pedido(s) registrados en el historial de ventas. Para conservar la trazabilidad contable, el registro debe mantenerse.`
      );
    }

    return prisma.client.delete({ where: { id } });
  }
}
