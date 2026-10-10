import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

// ── Startup Environment Validation ──────────────────────────────────
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`[Amazon Affiliate] ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  console.warn(`[Amazon Affiliate] ⚠️  Using fallback defaults. Set these in backend/.env for production.`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow cross-origin static uploads
  })
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes (Supports both standard express and Vercel serverless paths)
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/admin', '/admin-api'], adminRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Affilify E-Commerce API',
    uptime: process.uptime(),
  });
});

// Database identity endpoint (development only)
app.get('/api/health/database', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const response = {
    project: 'amazon-affiliate',
    database: isConnected ? mongoose.connection.name : null,
    connected: isConnected,
    timestamp: new Date().toISOString(),
  };

  // Only include host info in development mode
  if (process.env.NODE_ENV !== 'production') {
    response.host = isConnected ? mongoose.connection.host : null;
  }

  res.status(isConnected ? 200 : 503).json(response);
});

// Serve static frontend assets in production if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Route Handler for unmatched API endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server (Only when not executed inside Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[Affilify API] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Affilify API] Endpoint: http://localhost:${PORT}/api/health`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

export default app;

