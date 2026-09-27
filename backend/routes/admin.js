import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  listUsers,
  getUserDetails,
  updateUserRole,
  getGlobalUsage,
  getUserUsage,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/role', updateUserRole);
router.get('/usage/global', getGlobalUsage);
router.get('/usage/users', getUserUsage);

export default router;
