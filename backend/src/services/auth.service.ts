import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export class AuthService {
  public static async register(data: { email: string; password: string; name: string; phone?: string; address?: string; ciNit?: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw AppError.conflict('El correo electrónico ya se encuentra registrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'CLIENT',
        clientProfile: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            ciNit: data.ciNit || ''
          }
        }
      },
      include: { clientProfile: true }
    });

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }

  public static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { clientProfile: true }
    });

    if (!user) {
      throw AppError.unauthorized('Credenciales inválidas. Verifique su correo y contraseña.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized('Credenciales inválidas. Verifique su correo y contraseña.');
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientProfile: user.clientProfile
      },
      token
    };
  }

  private static generateToken(user: { id: string; email: string; role: string }) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
