import { prisma } from '../config/prisma';

export class ClientService {
  public static async getAllClients() {
    return prisma.client.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
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
    if (!client) throw new Error('Cliente no encontrado');
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
      throw new Error('El cliente no existe o ya fue eliminado.');
    }

    if (client._count.orders > 0) {
      throw new Error(
        `No es posible eliminar a "${client.name}" porque cuenta con ${client._count.orders} pedido(s) registrados en el historial de ventas. Para conservar la trazabilidad contable, el registro debe mantenerse.`
      );
    }

    return prisma.client.delete({ where: { id } });
  }
}

