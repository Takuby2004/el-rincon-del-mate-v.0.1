import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { generalApiLimiter } from './middlewares/security.middleware';

import { env } from './config/env';

const app = express();

// 0. Confianza en proxies inversos (Render, Vercel, Nginx) para rate limiting por IP real del cliente
app.set('trust proxy', 1);

// 1. Cabeceras de seguridad HTTP con Helmet (permitiendo carga de recursos estáticos cruzados)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. Configuración Segura de CORS
const allowedOrigins = env.ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman o server-to-server) o si coincide con la lista blanca
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origen ${origin} no permitido por la política CORS.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. Limitador de tasa general para rutas de la API
app.use('/api', generalApiLimiter);

// 5. Rutas de la API
app.use('/api', apiRouter);

// 6. Verificación del estado del backend
app.get('/', (req, res) => {
  res.json({
    app: 'El Rincón del Mate - Backend API',
    status: 'ONLINE',
    version: '1.0.0'
  });
});

// 7. Manejador de errores centralizado
app.use(errorHandler);

export default app;
