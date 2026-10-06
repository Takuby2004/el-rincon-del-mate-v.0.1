import dotenv from 'dotenv';
import path from 'path';

// Asegurar carga de variables de entorno
dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    '❌ [CONFIG FATAL] JWT_SECRET es obligatorio y debe tener al menos 32 caracteres seguros. Verifique su archivo .env.'
  );
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: jwtSecret,
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:4200']
};
