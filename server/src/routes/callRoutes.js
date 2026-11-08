import { Router } from 'express';
import {
  getIceServers,
  initiateCall,
  acceptCall,
  rejectCall,
  endCall,
  getCallHistory,
} from '../controllers/callController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/ice-servers', getIceServers);
router.post('/initiate', initiateCall);
router.patch('/:id/accept', acceptCall);
router.patch('/:id/reject', rejectCall);
router.patch('/:id/end', endCall);
router.get('/history', getCallHistory);

export default router;
