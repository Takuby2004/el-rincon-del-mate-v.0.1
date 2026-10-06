import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware para validar el cuerpo de una petición HTTP (req.body) usando un esquema Zod.
 * Si falla, retorna código 400 con los errores en español.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const errorMessages = issues.map((e: any) => {
          const path = Array.isArray(e.path) ? e.path.join('.') : '';
          return path ? `${path}: ${e.message}` : e.message;
        });

        return res.status(400).json({
          error: 'Datos de solicitud inválidos',
          details: errorMessages
        });
      }
      return res.status(400).json({ error: 'Formato de datos no válido' });
    }
  };
};

/**
 * Middleware para validar parámetros de consulta (req.query)
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const errorMessages = issues.map((e: any) => {
          const path = Array.isArray(e.path) ? e.path.join('.') : '';
          return path ? `${path}: ${e.message}` : e.message;
        });

        return res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: errorMessages
        });
      }
      return res.status(400).json({ error: 'Parámetros no válidos' });
    }
  };
};
