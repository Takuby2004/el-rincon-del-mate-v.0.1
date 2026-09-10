import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', apiRouter);

// Base Route Check
app.get('/', (req, res) => {
  res.json({
    app: 'El Rincón del Mate - Backend API',
    status: 'ONLINE',
    version: '1.0.0'
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
