import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Admin from '../src/models/Admin.js';
import AffiliateClick from '../src/models/AffiliateClick.js';
import SyncLog from '../src/models/SyncLog.js';
import Collection from '../src/models/Collection.js';
import WishlistItem from '../src/models/WishlistItem.js';
import PriceHistory from '../src/models/PriceHistory.js';

const PROJECT_NAME = 'Amazon Affiliate';
const EXPECTED_DB = 'amazon_affiliate_db';

async function verify() {
  console.log('===============================================================');
  console.log('[Amazon Affiliate] Starting Full Database Architecture Verification');
  console.log('===============================================================');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon_affiliate_db';

  // 1. Connect to the Amazon Affiliate database
  const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const connectedDb = conn.connection.name;

  console.log('[' + PROJECT_NAME + ']');
  console.log('Connected database: ' + connectedDb);

  if (connectedDb !== EXPECTED_DB && connectedDb !== 'ecs_affiliate') {
    throw new Error('Unexpected database connected: ' + connectedDb + '. Expected: ' + EXPECTED_DB);
  }

  // Safety check: verify NOT connected to prohibited databases
  if (['salonsync', 'salonsync_db', 'secure_evoting_db', 'voting_system'].includes(connectedDb.toLowerCase())) {
    throw new Error('CRITICAL: Prohibited database ' + connectedDb + ' detected! Aborting.');
  }

  // Initialize all model indexes & collections
  console.log('\n[Step 1-3] Initializing and checking collections & indexes...');
  await Promise.all([
    Product.init(),
    Category.init(),
    Admin.init(),
    AffiliateClick.init(),
    SyncLog.init(),
    Collection.init(),
    WishlistItem.init(),
    PriceHistory.init(),
  ]);

  // Ensure collections exist in MongoDB
  const db = conn.connection.db;
  const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
  console.log('Current Collections in ' + connectedDb + ':', existingCollections);

  const requiredCollections = [
    'products',
    'categories',
    'admins',
    'affiliate_clicks',
    'sync_logs',
    'collections',
    'wishlist_items',
    'price_history'
  ];

  for (const col of requiredCollections) {
    if (!existingCollections.includes(col)) {
      await db.createCollection(col);
      console.log('Created collection: ' + col);
    }
  }

  const finalCollections = (await db.listCollections().toArray()).map(c => c.name);
  console.log('\nConfirmed All Collections Exist in ' + connectedDb + ':');
  requiredCollections.forEach(c => {
    const present = finalCollections.includes(c);
    console.log('  - ' + c + ': ' + (present ? 'EXISTS (OK)' : 'MISSING'));
  });

  // [Step 6 & 7] Create / Confirm Category
  console.log('\n[Step 6 & 7] Testing Category creation & retrieval...');
  let testCat = await Category.findOne({ slug: 'home-decor' });
  if (!testCat) {
    testCat = await Category.create({
      name: 'Home Decor',
      slug: 'home-decor',
      description: 'Aesthetic modern home and living accessories',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
      isActive: true,
    });
    console.log('Created test Category: ' + testCat.name + ' (_id: ' + testCat._id + ')');
  } else {
    console.log('Found existing Category: ' + testCat.name + ' (_id: ' + testCat._id + ')');
  }

  const catVerify = await Category.findById(testCat._id);
  console.log('Confirmed Category appears in categories: ' + (!!catVerify && catVerify.name === 'Home Decor'));

  // [Step 4 & 5] Import one Amazon Product & confirm
  console.log('\n[Step 4 & 5] Testing Amazon Product import & retrieval...');
  const testAsin = 'B09G9FPHP7';
  let testProd = await Product.findOne({ platform: 'amazon', asin: testAsin });
  if (!testProd) {
    testProd = await Product.create({
      name: 'Echo Dot (5th Gen) Smart Speaker with Alexa | Deep Bass & Crisp Sound',
      slug: 'echo-dot-5th-gen-smart-speaker-alexa',
      shortDescription: 'Our best sounding Echo Dot yet with clearer vocals and vibrant sound in any room.',
      description: 'Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room. Just ask Alexa to play music, podcasts, and audiobooks.',
      images: [
        'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&auto=format&fit=crop&q=80'
      ],
      price: 4499,
      originalPrice: 5499,
      currency: 'INR',
      brand: 'Amazon',
      features: [
        'Vibrant sound with deeper bass and clear vocals',
        'Voice control your music and smart home devices',
        'Built-in motion & temperature sensors'
      ],
      tags: ['smart-speaker', 'alexa', 'echo-dot', 'amazon-devices'],
      categoryId: testCat._id,
      platform: 'amazon',
      asin: testAsin,
      externalProductId: testAsin,
      sourceUrl: 'https://www.amazon.in/dp/' + testAsin,
      affiliateUrl: 'https://www.amazon.in/dp/' + testAsin + '?tag=affilify-21',
      availability: 'In Stock',
      isActive: true,
      isFeatured: true,
      isTrending: true,
      clickCount: 0
    });
    console.log('Imported Amazon Product: ' + testProd.name + ' (ASIN: ' + testProd.asin + ', _id: ' + testProd._id + ')');
  } else {
    console.log('Found existing Amazon Product: ' + testProd.name + ' (ASIN: ' + testProd.asin + ', _id: ' + testProd._id + ')');
  }

  const prodVerify = await Product.findOne({ asin: testAsin, platform: 'amazon' });
  console.log('Confirmed Product appears in products collection: ' + (!!prodVerify && prodVerify.asin === testAsin));

  // [Step 8 & 9] Record one test affiliate click & confirm
  console.log('\n[Step 8 & 9] Testing Affiliate Click tracking & retrieval...');
  const testClick = await AffiliateClick.create({
    productId: testProd._id,
    platform: 'amazon',
    timestamp: new Date()
  });
  console.log('Recorded Affiliate Click _id: ' + testClick._id);

  const clickVerify = await AffiliateClick.findById(testClick._id);
  console.log('Confirmed Affiliate Click appears in affiliate_clicks: ' + (!!clickVerify && String(clickVerify.productId) === String(testProd._id)));

  // Test other new collections (SyncLog, Collection, WishlistItem, PriceHistory, Admin)
  console.log('\n[Additional Collection Tests]');
  
  // Test SyncLog
  const syncLog = await SyncLog.create({
    platform: 'amazon',
    syncType: 'manual',
    status: 'success',
    productsChecked: 1,
    productsAdded: 1,
    productsUpdated: 0,
    productsFailed: 0,
    startedAt: new Date(),
    completedAt: new Date()
  });
  console.log('Created SyncLog record _id: ' + syncLog._id + ' (Status: ' + syncLog.status + ')');

  // Test Collection
  let curatedCol = await Collection.findOne({ slug: 'trending-amazon-finds' });
  if (!curatedCol) {
    curatedCol = await Collection.create({
      name: 'Trending Amazon Finds',
      slug: 'trending-amazon-finds',
      description: 'Hand-picked viral and top-rated Amazon products this week',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230',
      productIds: [testProd._id],
      isActive: true,
      isFeatured: true
    });
    console.log('Created Curated Collection: ' + curatedCol.name + ' (_id: ' + curatedCol._id + ')');
  } else {
    console.log('Found existing Curated Collection: ' + curatedCol.name);
  }

  // Test PriceHistory
  const priceHistory = await PriceHistory.create({
    productId: testProd._id,
    price: testProd.price,
    originalPrice: testProd.originalPrice,
    currency: 'INR',
    recordedAt: new Date()
  });
  console.log('Created PriceHistory record _id: ' + priceHistory._id + ' (Price: Rs.' + priceHistory.price + ')');

  // Test WishlistItem
  const wishItem = await WishlistItem.create({
    productId: testProd._id,
    sessionId: 'sess_test_verification_987654'
  });
  console.log('Created WishlistItem record _id: ' + wishItem._id + ' (SessionId: ' + wishItem.sessionId + ')');

  // Test Admin
  let testAdmin = await Admin.findOne({ email: 'admin@affilify.com' });
  if (!testAdmin) {
    testAdmin = new Admin({
      name: 'Amazon Affiliate Admin',
      email: 'admin@affilify.com',
      role: 'admin',
      isActive: true,
      lastLoginAt: new Date()
    });
    testAdmin.password = 'Admin@123456';
    await testAdmin.save();
    console.log('Created Admin account: ' + testAdmin.email + ' (_id: ' + testAdmin._id + ')');
  } else {
    console.log('Found existing Admin account: ' + testAdmin.email);
  }

  // [Step 10] Confirm SalonSync and Secure E-Voting databases were not modified
  console.log('\n[Step 10] Isolation Audit - Checking other project databases on cluster...');
  const adminClient = new mongoose.mongo.Admin(conn.connection.db);
  const dbs = await adminClient.listDatabases();
  console.log('Databases currently on cluster:', dbs.databases.map(d => d.name));

  for (const otherDbName of ['Salonsync', 'secure_evoting_db']) {
    const otherDb = conn.connection.client.db(otherDbName);
    const otherCols = (await otherDb.listCollections().toArray()).map(c => c.name);
    console.log('\nDatabase [' + otherDbName + '] collections:', otherCols);
    
    // Check if amazon affiliate collections got accidentally created in other dbs
    const contaminated = otherCols.filter(c => ['affiliate_clicks', 'sync_logs', 'price_history', 'wishlist_items'].includes(c));
    if (contaminated.length > 0) {
      console.error('ERROR: Contamination detected in ' + otherDbName + ':', contaminated);
    } else {
      console.log('Isolation Check PASSED for ' + otherDbName + ': Zero affiliate collections present.');
    }
  }

  // Print index details for every collection
  console.log('\n===============================================================');
  console.log('FINAL SCHEMA & INDEX SUMMARY FOR ALL 8 COLLECTIONS');
  console.log('===============================================================');

  for (const colName of requiredCollections) {
    const indexes = await db.collection(colName).indexes();
    console.log('\nCollection: ' + colName);
    console.log('Indexes:');
    indexes.forEach(idx => {
      console.log('  - Key: ' + JSON.stringify(idx.key) + ' | Name: ' + idx.name + ' | Unique: ' + (!!idx.unique) + ' | Sparse: ' + (!!idx.sparse));
    });
  }

  await mongoose.disconnect();
  console.log('\n[Amazon Affiliate] Verification completed successfully and disconnected safely.');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
