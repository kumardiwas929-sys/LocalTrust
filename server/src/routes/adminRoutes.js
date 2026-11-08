import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getProviders,
  verifyProvider,
  rejectProvider,
  getBookings,
  getDisputes,
  getLiveJourneys,
  getAuditLogs,
  getSupportRequests,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPPORT));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/providers', getProviders);
router.patch('/providers/:id/verify', verifyProvider);
router.patch('/providers/:id/reject', rejectProvider);
router.get('/bookings', getBookings);
router.get('/disputes', getDisputes);
router.get('/live-tracking', getLiveJourneys);
router.get('/audit-logs', getAuditLogs);
router.get('/support-requests', getSupportRequests);

export default router;
