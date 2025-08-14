import { Router } from 'express';
import flightRoutes from './flightRoutes';

const router = Router();

// Mount flight routes
router.use('/flights', flightRoutes);

export default router;