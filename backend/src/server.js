import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration from both root and backend directories
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ── Startup Environment Validation ──────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  if (isProduction) {
    console.error(`[Amazon Affiliate] ❌ Production Configuration Error: Missing required environment variable(s): ${missingVars.join(', ')}`);
  } else {
    console.warn(`[Amazon Affiliate] ⚠️ Missing development environment variable(s): ${missingVars.join(', ')}`);
    console.warn(`[Amazon Affiliate] ⚠️ Using local fallback defaults. Populate backend/.env for full local functionality.`);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database for standalone/local server execution
if (process.env.VERCEL !== '1') {
  connectDB().catch((err) => {
    console.error(`[Amazon Affiliate] Initial database connection error: ${err.message}`);
  });
}

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

// ── Database Connection Middleware for Incoming Requests ───────────────
app.use(async (req, res, next) => {
  const cleanPath = (req.path || '').replace(/\/+$/, '');
  const cleanOriginal = (req.originalUrl || '').split('?')[0].replace(/\/+$/, '');

  // Allow health endpoint to respond even if database is connecting/unavailable
  if (
    cleanPath === '/api/health' ||
    cleanPath === '/health' ||
    cleanOriginal === '/api/health' ||
    cleanOriginal === '/health'
  ) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`[Amazon Affiliate] Database unavailable for ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(503).json({
      success: false,
      message: 'Service Temporarily Unavailable: Database connection failed.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Affilify E-Commerce API',
    database: isConnected ? 'connected' : (process.env.MONGODB_URI ? 'connecting_or_idle' : 'missing_uri_env'),
    databaseName: isConnected ? mongoose.connection.name : null,
    env: {
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    },
    uptime: process.uptime(),
  });
});

// Database identity endpoint
app.get(['/api/health/database', '/health/database'], async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      // Handled below by connection state check
    }
  }

  const isConnected = mongoose.connection.readyState === 1;
  const response = {
    project: 'amazon-affiliate',
    database: isConnected ? mongoose.connection.name : null,
    connected: isConnected,
    timestamp: new Date().toISOString(),
  };

  // Only include host info in development mode
  if (process.env.NODE_ENV === 'development') {
    response.host = isConnected ? mongoose.connection.host : null;
  }

  res.status(isConnected ? 200 : 503).json(response);
});

// Mount API Routes (Supports both standard express and Vercel serverless paths)
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/admin', '/admin-api'], adminRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

// Serve static frontend assets in standalone production mode
if (process.env.VERCEL !== '1') {
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
  console.error('[Amazon Affiliate] Unhandled Error:', err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let clientMessage = err.message || 'Internal Server Error';

  // Sanitize any database connection strings or secrets from client messages
  if (clientMessage.includes('mongodb') || clientMessage.includes('://')) {
    clientMessage = 'A database connection error occurred.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
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
  console.error(`[Amazon Affiliate] Unhandled Rejection: ${err.message}`);
});

export default app;


