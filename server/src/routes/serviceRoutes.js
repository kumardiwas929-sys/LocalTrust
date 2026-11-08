import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getFeaturedServices,
} from '../controllers/serviceController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { serviceCreateSchema } from '../validators/schemas.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/featured', getFeaturedServices);
router.get('/', optionalAuth, getServices);
router.get('/:id', optionalAuth, getServiceById);

// Provider / Admin write operations
router.post('/', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), validate(serviceCreateSchema), createService);
router.put('/:id', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), updateService);
router.delete('/:id', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), deleteService);

export default router;
