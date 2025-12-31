import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import packageRoutes from './package.routes';
import jamaahRoutes from './jamaah.routes';
import transactionRoutes from './transaction.routes';
import vendorRoutes from './vendor.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';
import notificationRoutes from './notification.routes';
import regionRoutes from './region.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ARG Finance API is running',
        timestamp: new Date().toISOString(),
    });
});

// API v1 routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/paket', packageRoutes);
router.use('/jamaah', jamaahRoutes);
router.use('/keuangan', transactionRoutes);
router.use('/vendor', vendorRoutes);
router.use('/laporan', reportRoutes);
router.use('/users', userRoutes);
router.use('/company', companyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/regions', regionRoutes);

export default router;


