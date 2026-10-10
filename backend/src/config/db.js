import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Ensure Atlas SRV records resolve cleanly
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PROJECT_NAME = 'Amazon Affiliate';
const ISOLATED_PROHIBITED_DBS = ['salonsync', 'salonsync_db', 'secure_evoting_db', 'voting_system'];

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon_affiliate_db';
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    const dbName = conn.connection.name;
    if (ISOLATED_PROHIBITED_DBS.includes(dbName.toLowerCase())) {
      console.error(`[${PROJECT_NAME}] FATAL: Connected to prohibited database "${dbName}" belonging to another project!`);
      console.error(`[${PROJECT_NAME}] Aborting connection immediately to protect project data.`);
      await mongoose.disconnect();
      throw new Error(`Connection rejected: Database "${dbName}" is strictly isolated.`);
    }
    console.log(`[${PROJECT_NAME}]`);
    console.log(`Connected database: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`[${PROJECT_NAME}] Database connection failed: ${error.message}`);
    return null;
  }
};

export default connectDB;
