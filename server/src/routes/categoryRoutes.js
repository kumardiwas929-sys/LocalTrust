import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', optionalAuth, getCategories);
router.get('/:id', getCategoryById);

// Admin operations
router.post('/', authenticate, authorize(ROLES.ADMIN), createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), updateCategory);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteCategory);

export default router;
