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

    // Products (Amazon-exclusive catalog)
    const productsData = [
      {
        name: 'Echo Dot (5th Gen) Smart Speaker with Alexa | Deep Bass & Crisp Sound',
        slug: 'echo-dot-5th-gen-smart-speaker-with-alexa',
        shortDescription: 'Our best sounding Echo Dot yet with clearer vocals and vibrant sound in any room.',
        description: 'Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room. Just ask Alexa to play music, podcasts, and audiobooks.',
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&auto=format&fit=crop&q=80',
        ],
        price: 4499,
        originalPrice: 5499,
        category: categoryMap['electronics-and-gadgets'],
        brand: 'Amazon',
        features: [
          'Vibrant sound with deeper bass and clear vocals',
          'Voice control your music and smart home devices',
          'Built-in motion & temperature sensors',
        ],
        asin: 'B09G9FPHP7',
        externalProductId: 'B09G9FPHP7',
        platform: 'amazon',
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B09G9FPHP7?tag=affilify-21',
        sourceUrl: 'https://www.amazon.in/dp/B09G9FPHP7',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: true,
        isActive: true,
        tags: ['smart-speaker', 'alexa', 'echo-dot', 'amazon-devices'],
        clickCount: 15,
      },
      {
        name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        shortDescription: 'Industry-leading noise cancellation with 2 processors, 8 microphones, and ultra-comfortable lightweight design.',
        description: 'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. 2 processors control 8 microphones for unprecedented noise cancellation and exceptional call quality.',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        price: 26990,
        originalPrice: 34990,
        category: categoryMap['electronics-and-gadgets'],
        brand: 'Sony',
        features: [
          'Industry-leading noise cancellation with 8 microphones',
          'High-Resolution Audio with DSEE Extreme engine',
          'Crystal clear hands-free calling with beamforming mics',
          '30-hour battery life with 3-minute quick charging',
        ],
        asin: 'B09XS7JWHH',
        externalProductId: 'B09XS7JWHH',
        platform: 'amazon',
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B09XS7JWHH?tag=affilify-21',
        sourceUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: true,
        isActive: true,
        tags: ['headphones', 'wireless', 'sony', 'audio'],
        clickCount: 142,
      },
      {
        name: 'Delonghi Dedica Deluxe 15-Bar Pump Espresso & Cappuccino Machine',
        slug: 'delonghi-dedica-deluxe-espresso-machine',
        shortDescription: 'Compact 6-inch stainless steel barista espresso machine with manual milk frothing wand.',
        description: 'Craft rich, authentic Italian espresso, velvety lattes, and frothy cappuccinos at home with 15-bar pump extraction and Thermoblock heating.',
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        ],
        price: 18490,
        originalPrice: 24990,
        category: categoryMap['kitchen-and-dining'],
        brand: 'DeLonghi',
        features: [
          '15-bar professional Italian pump extraction',
          'Rapid Thermoblock heating system ready in 40s',
          'Adjustable premium manual milk steam wand',
        ],
        asin: 'B01M0S0S0S',
        externalProductId: 'B01M0S0S0S',
        platform: 'amazon',
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B01M0S0S0S?tag=affilify-21',
        sourceUrl: 'https://www.amazon.in/dp/B01M0S0S0S',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: false,
        isActive: true,
        tags: ['coffee', 'espresso', 'kitchen', 'appliances'],
        clickCount: 77,
      },
    ];

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
