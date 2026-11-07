import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

export const categoriesData = [
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-and-gadgets',
    description: 'Smartphones, headphones, smartwatches, mechanical keyboards & audio gear.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 1,
  },
  {
    name: 'Home & Living',
    slug: 'home-and-living',
    description: 'Modern ambient lamps, ergonomic chairs, aesthetic organizers & home decor.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 2,
  },
  {
    name: 'Fashion & Style',
    slug: 'fashion-and-style',
    description: 'Trending streetwear, footwear, luxury watches, and curated apparel.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 3,
  },
  {
    name: 'Kitchen & Dining',
    slug: 'kitchen-and-dining',
    description: 'Espresso coffee machines, air fryers, cast iron skillets & barista accessories.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 4,
  },
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-and-skincare',
    description: 'Organic serums, premium fragrances, grooming kits & skincare essentials.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 5,
  },
  {
    name: 'Fitness & Outdoors',
    slug: 'fitness-and-outdoors',
    description: 'Smart fitness trackers, yoga mats, resistance kits & outdoor adventure gear.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    order: 6,
  },
];

export const seedDatabase = async () => {
  try {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@affilify.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';

    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = new Admin({
        name: 'Affilify Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
      });
      await admin.save();
      console.log(`[Database Seed] Created Superadmin account (${adminEmail})`);
    }

    // Upsert Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ slug: cat.slug });
      if (!existingCat) {
        existingCat = await Category.create(cat);
        console.log(`[Database Seed] Created Category: ${cat.name}`);
      }
      categoryMap[cat.slug] = existingCat._id;
    }

    // Products catalog is kept completely empty for manual administration
    const productsData = [];

    for (const p of productsData) {
      try {
        const existingProduct = await Product.findOne({ name: p.name });
        if (!existingProduct) {
          await Product.create(p);
          console.log(`[Database Seed] Created Product: ${p.name.substring(0, 35)}...`);
        }
      } catch (productErr) {
        console.warn(`[Database Seed Warning] Product ${p.name.substring(0, 25)}: ${productErr.message}`);
      }
    }

    console.log('[Database Seed] Seeding routine completed.');
  } catch (err) {
    console.error('[Database Seed Error]:', err.message);
  }
};

// If run directly via CLI (node seed.js)
if (process.argv[1]?.endsWith('seed.js')) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_affiliate';
  mongoose.connect(mongoUri).then(async () => {
    console.log(`Connected to ${mongoUri}`);
    await seedDatabase();
    process.exit(0);
  }).catch((err) => {
    console.error('Seed CLI connection failed:', err.message);
    process.exit(1);
  });
}
