import { Router } from 'express';
import {
  onboarding,
  getProviderProfile,
  getMeDashboard,
  uploadDocuments,
  updateAvailability,
  getTrustPassport,
} from '../controllers/providerController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { providerOnboardingSchema, availabilityUpdateSchema } from '../validators/schemas.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public routes
router.get('/:id/trust-passport', getTrustPassport);
router.get('/:id', optionalAuth, getProviderProfile);

// Protected provider routes
router.use(authenticate);
router.post('/onboarding', authorize(ROLES.PROVIDER), validate(providerOnboardingSchema), onboarding);
router.get('/me/dashboard', authorize(ROLES.PROVIDER), getMeDashboard);
router.post('/documents', authorize(ROLES.PROVIDER), upload.single('document'), uploadDocuments);
router.put('/availability', authorize(ROLES.PROVIDER), validate(availabilityUpdateSchema), updateAvailability);

export default router;
