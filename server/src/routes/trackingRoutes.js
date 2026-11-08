import { Router } from 'express';
import {
  startTracking,
  updateLocation,
  getLiveTracking,
  markArrived,
  stopTracking,
} from '../controllers/trackingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/:bookingId', getLiveTracking);
router.post('/:bookingId/start', startTracking);
router.post('/:bookingId/location', updateLocation);
router.post('/:bookingId/arrived', markArrived);
router.post('/:bookingId/stop', stopTracking);

export default router;
