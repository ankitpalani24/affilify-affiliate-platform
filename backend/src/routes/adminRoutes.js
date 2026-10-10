import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats,
  getClickLogs,
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public auth
router.post('/login', loginAdmin);

// Protected admin endpoints
router.get('/me', protectAdmin, getAdminProfile);
router.put('/profile', protectAdmin, updateAdminProfile);
router.get('/dashboard', protectAdmin, getDashboardStats);
router.get('/clicks', protectAdmin, getClickLogs);

export default router;
