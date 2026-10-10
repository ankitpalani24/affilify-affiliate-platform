import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { memoryStore } from '../utils/store.js';
import mongoose from 'mongoose';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_ecs_affiliate_jwt_key_2026_secure'
    );

    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        req.admin = admin;
        return next();
      }
    }

    // Fallback store check
    if (decoded.id === memoryStore.admin._id || decoded.id) {
      req.admin = {
        _id: memoryStore.admin._id,
        name: memoryStore.admin.name,
        email: memoryStore.admin.email,
        role: memoryStore.admin.role,
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Admin account not found.',
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired. Please log in again.',
    });
  }
};
