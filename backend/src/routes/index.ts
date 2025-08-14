import { Router } from 'express';
import flightRoutes from './flightRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Mount auth routes (no protection needed)
router.use('/auth', authRoutes);

// Mount flight routes
router.use('/flights', flightRoutes);

export default router;