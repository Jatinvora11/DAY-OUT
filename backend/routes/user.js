import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/userController.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);

router.put(
  '/profile',
  [
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  ],
  validate,
  updateProfile,
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword,
);

router.delete('/', deleteAccount);

export default router;
