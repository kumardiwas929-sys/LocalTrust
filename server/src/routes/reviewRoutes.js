import { Router } from 'express';
import {
  createReview,
  getProviderReviews,
  getMyReviews,
  reportReview,
} from '../controllers/reviewController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { reviewCreateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/provider/:id', optionalAuth, getProviderReviews);

router.use(authenticate);

router.post('/', validate(reviewCreateSchema), createReview);
router.get('/my', getMyReviews);
router.post('/:id/report', reportReview);

export default router;
