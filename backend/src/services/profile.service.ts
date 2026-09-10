import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';

export class ProfileService {
  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        clientProfile: true
      }
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  public static async updateProfile(userId: string, data: { name?: string; phone?: string; address?: string; ciNit?: string; password?: string }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true, clientProfile: true }
    });

    if (updatedUser.clientProfile) {
      await prisma.client.update({
        where: { id: updatedUser.clientProfile.id },
        data: {
          name: data.name || updatedUser.name,
          phone: data.phone ?? updatedUser.clientProfile.phone,
          address: data.address ?? updatedUser.clientProfile.address,
          ciNit: data.ciNit ?? updatedUser.clientProfile.ciNit
        }
      });
    }

    return this.getProfile(userId);
  }
}
