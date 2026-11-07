import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration from both root and backend directories
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Ensure Atlas SRV records resolve cleanly (avoid in serverless sandbox where dns.setServers is restricted)
if (!process.env.VERCEL && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore DNS server override errors in restricted environments
  }
}

const PROJECT_NAME = 'Amazon Affiliate';
const ISOLATED_PROHIBITED_DBS = [
  'salonsync',
  'salonsync_db',
  'secure_evoting_db',
  'voting_system',
  'evoting',
  'salon',
];

let cachedConn = null;
let cachedPromise = null;

const validateDatabaseName = (dbName) => {
  if (!dbName) {
    throw new Error('Database validation failed: Connected database name is empty.');
  }

  const normalized = dbName.toLowerCase();

  // Strict prohibited project check
  for (const prohibited of ISOLATED_PROHIBITED_DBS) {
    if (normalized.includes(prohibited)) {
      throw new Error(`CRITICAL: Access rejected. Database "${dbName}" belongs to an isolated project.`);
    }
  }

  // Affirmative affiliate database naming validation
  const isAffiliateDb = normalized.includes('affiliate') || normalized.includes('affilify');
  if (!isAffiliateDb) {
    console.warn(`[${PROJECT_NAME}] ⚠️ Notice: Connected database "${dbName}" is outside standard affiliate naming conventions.`);
  }
};

const connectDB = async () => {
  // Reuse existing active connection
  if (mongoose.connection.readyState === 1) {
    return cachedConn || mongoose.connection;
  }

  // Reuse pending in-flight connection promise if currently connecting
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (isProduction) {
      const configError = new Error('Configuration Error: MONGODB_URI environment variable is required in production.');
      console.error(`[${PROJECT_NAME}] ❌ ${configError.message}`);
      throw configError;
    } else {
      mongoUri = 'mongodb://localhost:27017/amazon_affiliate_db';
      console.warn(`[${PROJECT_NAME}] ⚠️ MONGODB_URI not found. Using local fallback: mongodb://localhost:27017/amazon_affiliate_db`);
    }
  }

  mongoose.set('strictQuery', false);

  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    })
    .then((conn) => {
      cachedConn = conn;
      const dbName = conn.connection.name;
      validateDatabaseName(dbName);
      console.log(`[${PROJECT_NAME}] ✅ Connected to database: ${dbName}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      cachedConn = null;
      console.error(`[${PROJECT_NAME}] ❌ Database connection failed: ${error.message}`);
      throw error;
    });

  return cachedPromise;
};

export default connectDB;


