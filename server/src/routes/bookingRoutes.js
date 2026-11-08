import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  startJourney,
  markArrived,
  startWork,
  requestPriceChange,
  approvePriceChange,
  cancelBooking,
  rescheduleBooking,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { bookingCreateSchema, priceChangeRequestSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(bookingCreateSchema), createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);

// Status transition endpoints
router.patch('/:id/accept', acceptBooking);
router.patch('/:id/reject', rejectBooking);
router.patch('/:id/start-journey', startJourney);
router.patch('/:id/arrived', markArrived);
router.patch('/:id/start-work', startWork);
router.patch('/:id/price-change', validate(priceChangeRequestSchema), requestPriceChange);
router.patch('/:id/approve-price', approvePriceChange);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', rescheduleBooking);

export default router;
