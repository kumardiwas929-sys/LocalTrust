import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getFavorites);
router.post('/:providerId', addFavorite);
router.delete('/:providerId', removeFavorite);

export default router;
