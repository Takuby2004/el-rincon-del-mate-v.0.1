/**
 * Clase personalizada para errores operacionales de la aplicación.
 * Permite tipar el código HTTP (400, 401, 403, 404, 409, 500)
 * y distinguir errores controlados de fallas de programación.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restaurar cadena de prototipos en TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  public static unauthorized(message: string = 'No autenticado o token inválido'): AppError {
    return new AppError(message, 401);
  }

  public static forbidden(message: string = 'Acceso denegado: permisos insuficientes'): AppError {
    return new AppError(message, 403);
  }

  public static notFound(message: string = 'Recurso no encontrado'): AppError {
    return new AppError(message, 404);
  }

  public static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  public static internal(message: string = 'Error interno del servidor'): AppError {
    return new AppError(message, 500, false);
  }
}
