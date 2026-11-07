import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const TARGET_DB = 'amazon_affiliate_db';
const FORBIDDEN_DBS = ['salonsync', 'salonsync_db', 'secure_evoting_db', 'voting_system'];

async function runCleanup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(uri);

  const activeDbName = mongoose.connection.name;
  console.log(`Connected to database: ${activeDbName}`);

  // Strict safety check
  if (activeDbName !== TARGET_DB) {
    throw new Error(`SAFETY ERROR: Expected database "${TARGET_DB}", but connected to "${activeDbName}". ABORTING immediately.`);
  }

  if (FORBIDDEN_DBS.includes(activeDbName.toLowerCase())) {
    throw new Error(`SAFETY VIOLATION: Database "${activeDbName}" is on the protected blacklist. ABORTING immediately.`);
  }

  const db = mongoose.connection.db;

  // 1. Audit before counts
  const productsBefore = await db.collection('products').countDocuments();
  const activeProductsBefore = await db.collection('products').countDocuments({ isActive: true });
  const inactiveProductsBefore = await db.collection('products').countDocuments({ isActive: false });
  const categoriesBefore = await db.collection('categories').countDocuments();
  const adminsBefore = await db.collection('admins').countDocuments();
  const clicksBefore = await db.collection('affiliate_clicks').countDocuments();
  const priceHistoryBefore = await db.collection('price_history').countDocuments();
  const wishlistBefore = await db.collection('wishlist_items').countDocuments();
  const collectionsBefore = await db.collection('collections').countDocuments();

  console.log('--- PRE-CLEANUP AUDIT ---');
  console.log(`Products Total: ${productsBefore} (Active: ${activeProductsBefore}, Inactive: ${inactiveProductsBefore})`);
  console.log(`Categories: ${categoriesBefore}`);
  console.log(`Admins: ${adminsBefore}`);
  console.log(`Affiliate Clicks: ${clicksBefore}`);
  console.log(`Price History records: ${priceHistoryBefore}`);
  console.log(`Wishlist Items: ${wishlistBefore}`);
  console.log(`Collections: ${collectionsBefore}`);

  // 2. Perform Deletions
  console.log('\n--- EXECUTING DELETIONS ---');
  const productDeleteRes = await db.collection('products').deleteMany({});
  console.log(`Deleted ${productDeleteRes.deletedCount} products from 'products' collection.`);

  // Clean orphaned references
  const clicksDeleteRes = await db.collection('affiliate_clicks').deleteMany({});
  console.log(`Deleted ${clicksDeleteRes.deletedCount} sample click records from 'affiliate_clicks'.`);

  const priceHistoryDeleteRes = await db.collection('price_history').deleteMany({});
  console.log(`Deleted ${priceHistoryDeleteRes.deletedCount} price history records.`);

  const wishlistDeleteRes = await db.collection('wishlist_items').deleteMany({});
  console.log(`Deleted ${wishlistDeleteRes.deletedCount} wishlist items.`);

  const collectionsUpdateRes = await db.collection('collections').updateMany({}, { $set: { productIds: [] } });
  console.log(`Updated ${collectionsUpdateRes.modifiedCount} collections (emptied productIds array).`);

  // 3. Post-cleanup verification
  const productsAfter = await db.collection('products').countDocuments();
  const categoriesAfter = await db.collection('categories').countDocuments();
  const adminsAfter = await db.collection('admins').countDocuments();
  const clicksAfter = await db.collection('affiliate_clicks').countDocuments();
  const priceHistoryAfter = await db.collection('price_history').countDocuments();
  const wishlistAfter = await db.collection('wishlist_items').countDocuments();

  console.log('\n--- POST-CLEANUP VERIFICATION ---');
  console.log(`Products Remaining: ${productsAfter}`);
  console.log(`Categories Intact: ${categoriesAfter}`);
  console.log(`Admins Intact: ${adminsAfter}`);
  console.log(`Orphaned Clicks Remaining: ${clicksAfter}`);
  console.log(`Price History Remaining: ${priceHistoryAfter}`);
  console.log(`Wishlist Items Remaining: ${wishlistAfter}`);

  await mongoose.disconnect();

  return {
    database: activeDbName,
    productsBefore,
    productsAfter,
    categoriesCount: categoriesAfter,
    adminsCount: adminsAfter,
    orphansCleaned: clicksDeleteRes.deletedCount + priceHistoryDeleteRes.deletedCount + wishlistDeleteRes.deletedCount,
  };
}

runCleanup()
  .then((res) => {
    console.log('\nSUCCESS:', JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nCLEANUP FAILED:', err.message);
    process.exit(1);
  });
