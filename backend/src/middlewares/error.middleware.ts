import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import multer from 'multer';

/**
 * Middleware centralizado de gestión de excepciones para toda la API.
 * Captura AppError operacionales, errores Zod de validación, violaciones Prisma y errores inesperados.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. Errores operacionales explícitos (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // 2. Errores de validación de esquemas Zod
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const details = issues.map((e: any) => {
      const path = Array.isArray(e.path) ? e.path.join('.') : '';
      return path ? `${path}: ${e.message}` : e.message;
    });

    return res.status(400).json({
      error: 'Datos de solicitud inválidos',
      details
    });
  }

  // 3. Errores de subida de archivos de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo excede el tamaño máximo permitido de 5 MB'
      });
    }
    return res.status(400).json({
      error: `Error al procesar archivo: ${err.message}`
    });
  }

  // 4. Errores conocidos de base de datos Prisma
  if (err?.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'campo único';
    return res.status(409).json({
      error: `Conflicto: Ya existe un registro con este valor para ${target}`
    });
  }

  if (err?.code === 'P2025') {
    return res.status(404).json({
      error: 'El registro solicitado no fue encontrado en la base de datos'
    });
  }

  // 5. Errores genéricos no controlados (500)
  console.error('[UNHANDLED_ERROR]', err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Ha ocurrido un error interno en el servidor'
    : (err.message || 'Error interno del servidor');

  return res.status(status).json({ error: message });
};
