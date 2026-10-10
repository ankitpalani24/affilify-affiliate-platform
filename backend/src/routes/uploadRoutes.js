import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../controllers/uploadController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Single image upload
router.post('/single', protectAdmin, upload.single('image'), uploadImage);

// Multiple images upload
router.post('/multiple', protectAdmin, upload.array('images', 8), uploadImage);

export default router;
