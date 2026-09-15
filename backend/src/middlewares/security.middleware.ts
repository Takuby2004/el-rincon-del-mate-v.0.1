import rateLimit from 'express-rate-limit';

/**
 * Limitador general de tasa para la API (120 solicitudes por minuto por IP)
 */
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 120, // Máximo 120 peticiones por ventana
  standardHeaders: true, // Devuelve información de límite en cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita cabeceras antiguas `X-RateLimit-*`
  message: {
    error: 'Demasiadas solicitudes desde esta dirección IP. Por favor intenta de nuevo en un minuto.'
  }
});

/**
 * Limitador estricto para inicio de sesión y autenticación (5 intentos por minuto por IP)
 * Protege contra ataques de fuerza bruta (adivinar contraseñas).
 */
export const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // Máximo 5 intentos de inicio de sesión por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos fallidos de inicio de sesión. Por seguridad, espera 1 minuto antes de volver a intentar.'
  }
});
