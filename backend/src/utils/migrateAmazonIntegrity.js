import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const AMAZON_URL_REGEX = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:amazon\.(?:in|com|co\.uk|de|ca)|amzn\.(?:to|in))\/.+/i;
const ASIN_REGEX = /^[A-Z0-9]{10}$/i;

async function runMigration() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI missing from environment.');
    process.exit(1);
  }

  console.log('[Amazon Audit] Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log(`[Amazon Audit] Connected to database: ${mongoose.connection.name}`);

  if (mongoose.connection.name !== 'amazon_affiliate_db') {
    console.error(`❌ Connected to unexpected database: ${mongoose.connection.name}`);
    process.exit(1);
  }

  const collection = db.collection('products');
  const products = await collection.find({}).toArray();
  console.log(`[Amazon Audit] Auditing ${products.length} products...`);

  let validCount = 0;
  let correctedCount = 0;
  let deactivatedCount = 0;

  for (const p of products) {
    const url = p.affiliateUrl || '';
    const isAmazonUrl = AMAZON_URL_REGEX.test(url);
    const urlAsinMatch = url.match(/(?:\/dp\/|\/gp\/product\/|\/product\/)([A-Z0-9]{10})(?:[/?#]|$)/i);
    const extractedAsin = urlAsinMatch ? urlAsinMatch[1].toUpperCase() : null;

    console.log(`\nChecking product: "${p.name}" (ID: ${p._id})`);
    console.log(`  Current URL: ${url}`);
    console.log(`  Current ASIN: ${p.asin}`);
    console.log(`  Is Amazon URL: ${isAmazonUrl}`);
    console.log(`  Extracted ASIN: ${extractedAsin}`);

    if (isAmazonUrl && extractedAsin && ASIN_REGEX.test(extractedAsin)) {
      // Valid Amazon URL with valid 10-char ASIN
      const updateDoc = {
        asin: extractedAsin,
        externalProductId: extractedAsin,
        sourceUrl: `https://www.amazon.in/dp/${extractedAsin}`,
        platform: 'amazon',
        isActive: true,
        lastSyncStatus: 'synced',
        lastSyncedAt: new Date(),
      };
      await collection.updateOne({ _id: p._id }, { $set: updateDoc });
      console.log(`  -> ACTION: Marked VALID AMAZON & synced ASIN ${extractedAsin}`);
      validCount++;
      if (!p.asin || p.asin !== extractedAsin) correctedCount++;
    } else {
      // Invalid URL (Myntra / Flipkart / fake ASIN) and no valid Amazon ASIN exists
      const reason = !isAmazonUrl
        ? `invalid: non-Amazon marketplace URL (${url.includes('flipkart') ? 'Flipkart' : url.includes('myntra') ? 'Myntra' : 'Third-Party'}) on Amazon-only platform`
        : `invalid: malformed/placeholder ASIN in URL (${url})`;

      const updateDoc = {
        platform: 'amazon',
        isActive: false,
        lastSyncStatus: reason,
        lastSyncedAt: new Date(),
      };
      await collection.updateOne({ _id: p._id }, { $set: updateDoc });
      console.log(`  -> ACTION: DEACTIVATED product. Reason: ${reason}`);
      deactivatedCount++;
    }
  }

  // Ensure compound index on platform + asin
  try {
    console.log('\n[Amazon Audit] Creating partial unique index on { platform: 1, asin: 1 }...');
    await collection.createIndex(
      { platform: 1, asin: 1 },
      {
        unique: true,
        partialFilterExpression: { asin: { $type: 'string' } },
        name: 'unique_platform_asin',
      }
    );
    console.log('[Amazon Audit] ✅ Index created successfully.');
  } catch (idxErr) {
    console.warn('[Amazon Audit] Notice on index creation:', idxErr.message);
  }

  console.log('\n========================================');
  console.log('AUDIT & MIGRATION SUMMARY:');
  console.log(`Total Products: ${products.length}`);
  console.log(`Active Valid Amazon Products: ${validCount}`);
  console.log(`Corrected Products: ${correctedCount}`);
  console.log(`Deactivated Invalid Products: ${deactivatedCount}`);
  console.log('========================================');

  await mongoose.disconnect();
  console.log('[Amazon Audit] Disconnected cleanly.');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

