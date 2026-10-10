import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleFeatured,
  toggleTrending,
  trackProductClick,
  getProductFiltersMeta,
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/filters/meta', getProductFiltersMeta);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/click', trackProductClick);
router.get('/:id', getProductById);

// Admin-protected routes
router.post('/', protectAdmin, createProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.patch('/:id/status', protectAdmin, toggleProductStatus);
router.patch('/:id/featured', protectAdmin, toggleFeatured);
router.patch('/:id/trending', protectAdmin, toggleTrending);

export default router;
