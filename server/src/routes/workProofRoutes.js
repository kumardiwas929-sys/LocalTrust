import { Router } from 'express';
import {
  submitWorkProof,
  getWorkProof,
  approveWorkProof,
  requestRevision,
} from '../controllers/workProofController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { workProofSubmitSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/:bookingId', getWorkProof);
router.post('/:bookingId', validate(workProofSubmitSchema), submitWorkProof);
router.patch('/:bookingId/approve', approveWorkProof);
router.patch('/:bookingId/revision', requestRevision);

export default router;
