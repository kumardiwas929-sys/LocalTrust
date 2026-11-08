import { Router } from 'express';
import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  updateDisputeAdmin,
} from '../controllers/disputeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { disputeCreateSchema } from '../validators/schemas.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(disputeCreateSchema), createDispute);
router.get('/my', getMyDisputes);
router.get('/:id', getDisputeById);
router.patch('/:id/admin', authorize(ROLES.ADMIN, ROLES.SUPPORT), updateDisputeAdmin);

export default router;
