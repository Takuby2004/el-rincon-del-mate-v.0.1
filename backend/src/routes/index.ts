import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import clientRoutes from './client.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import paymentQrRoutes from './paymentQr.routes';
import paymentRoutes from './payment.routes';
import statsRoutes from './stats.routes';
import reportRoutes from './report.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payment-qr', paymentQrRoutes);
apiRouter.use('/', paymentRoutes); // Handles /api/admin/payments/:id/approve & reject
apiRouter.use('/admin/statistics', statsRoutes);
apiRouter.use('/admin/reports', reportRoutes);

export default apiRouter;
