import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere token de autenticación.' });
  }

  try {
    // 1. Verificación primaria: Bóveda de Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      const email = data.user.email?.toLowerCase().trim() || '';
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').toLowerCase().trim();
      const isEmailAdmin = !!email && email === adminEmail;

      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      const effectiveRole = isEmailAdmin ? 'ADMIN' : (dbUser?.role || 'CLIENT');

      req.user = {
        id: dbUser?.id || data.user.id,
        email,
        role: effectiveRole
      };
      return next();
    }

    // 2. Verificación secundaria: Token legacy local
    if (env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.user = decoded;
        return next();
      } catch {
        // Falló también legacy
      }
    }

    return res.status(403).json({ error: 'Token inválido o expirado.' });
  } catch (err) {
    return res.status(403).json({ error: 'Error al verificar token de autenticación.' });
  }
};

/**
 * Autenticación opcional: Si viene cabecera Authorization válida, extrae el usuario;
 * si no viene o es anónimo, continúa la petición sin arrojar error 401.
 */
export const optionalAuthenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      const email = data.user.email?.toLowerCase().trim() || '';
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com').toLowerCase().trim();
      const isEmailAdmin = !!email && email === adminEmail;

      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      const effectiveRole = isEmailAdmin ? 'ADMIN' : (dbUser?.role || 'CLIENT');

      req.user = {
        id: dbUser?.id || data.user.id,
        email,
        role: effectiveRole
      };
      return next();
    }

    if (env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.user = decoded;
      } catch {
        // No bloquea
      }
    }
  } catch {
    // No bloquea
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Privilegios de administrador requeridos.' });
  }
  next();
};
