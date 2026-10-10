import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';

dotenv.config();

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

    // Products
    const productsData = [
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
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B09XS7JWHH?tag=affilify-21',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: true,
        isActive: true,
        tags: ['headphones', 'wireless', 'sony', 'audio'],
        clickCount: 142,
      },
      {
        name: 'Apple Watch Series 9 GPS 45mm Smartwatch with Midnight Aluminum Case',
        slug: 'apple-watch-series-9-gps-45mm',
        shortDescription: 'Powerful S9 SiP, Double tap gesture, brighter display, on-device Siri, and advanced health tracking.',
        description: 'Apple Watch Series 9 helps you stay connected, active, healthy, and safe. Features double tap magic gesture, an even brighter display, and advanced ECG/blood oxygen sensors.',
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        ],
        price: 41999,
        originalPrice: 44900,
        category: categoryMap['electronics-and-gadgets'],
        brand: 'Apple',
        features: [
          'S9 SiP with 64-bit dual-core processor',
          'Magic Double Tap gesture for hands-free actions',
          'Always-On Retina display up to 2000 nits',
          'Advanced ECG, Heart Rate and Sleep tracking',
        ],
        affiliatePlatform: 'Flipkart',
        affiliateUrl: 'https://www.flipkart.com/apple-watch-series-9-gps-45mm/p/itm123456?affid=affilify',
        buyButtonText: 'Buy on Flipkart',
        isFeatured: true,
        isTrending: true,
        isActive: true,
        tags: ['smartwatch', 'apple', 'fitness', 'tech'],
        clickCount: 98,
      },
      {
        name: 'Nordic Minimalist Dimmable LED Touch Desk Lamp with Wireless Charging',
        slug: 'nordic-minimalist-dimmable-led-touch-lamp',
        shortDescription: 'Sleek matte finish architectural lamp with built-in 15W fast wireless Qi charger and stepless dimming.',
        description: 'Elevate your workspace or bedside table with this architectural Scandinavian lamp with integrated 15W Qi wireless charger and smooth touch stepless brightness.',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
        ],
        price: 2499,
        originalPrice: 4999,
        category: categoryMap['home-and-living'],
        brand: 'Lumina Home',
        features: [
          'Built-in 15W Qi Fast Wireless Phone Charger',
          '3 Color Modes (3000K, 4500K, 6000K)',
          'Flicker-free eye-caring soft diffused illumination',
        ],
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B08XYZ123?tag=affilify-21',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: false,
        isActive: true,
        tags: ['lamp', 'decor', 'lighting', 'minimalist'],
        clickCount: 83,
      },
      {
        name: 'Men Slim Fit Textured Casual Blazer in Charcoal Grey',
        slug: 'men-slim-fit-textured-casual-blazer-charcoal',
        shortDescription: 'Premium wool-blend unstructured casual blazer crafted with notched lapels and double vents.',
        description: 'A versatile wardrobe essential tailored for modern sharp silhouettes. Made from stretch wool blend with dual inner utility pockets.',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
        ],
        price: 3499,
        originalPrice: 6999,
        category: categoryMap['fashion-and-style'],
        brand: 'Raymond',
        features: [
          'Premium breathable fabric blend with stretch comfort',
          'Notch lapel with two-button single-breasted closure',
          'Dual internal welt pockets for phone and wallet',
        ],
        affiliatePlatform: 'Myntra',
        affiliateUrl: 'https://www.myntra.com/blazers/raymond/men-charcoal-blazer/12345/buy?aff=affilify',
        buyButtonText: 'Buy on Myntra',
        isFeatured: true,
        isTrending: true,
        isActive: true,
        tags: ['fashion', 'blazer', 'menswear', 'clothing'],
        clickCount: 112,
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
        affiliatePlatform: 'Amazon',
        affiliateUrl: 'https://www.amazon.in/dp/B01M0S0S0S?tag=affilify-21',
        buyButtonText: 'Buy on Amazon',
        isFeatured: true,
        isTrending: false,
        isActive: true,
        tags: ['coffee', 'espresso', 'kitchen', 'appliances'],
        clickCount: 77,
      },
      {
        name: 'Forest Essentials Soundarya Radiance Facial Serum with 24K Gold',
        slug: 'forest-essentials-soundarya-radiance-serum-24k-gold',
        shortDescription: 'Ayurvedic anti-aging miracle serum enriched with 24-karat gold bhasma and pure cold-pressed sesame oil.',
        description: 'A traditional Ayurvedic formulation infused with genuine 24-karat gold bhasma. Helps improve skin elasticity, stimulate collagen production, and diminish fine lines.',
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
        ],
        price: 4975,
        originalPrice: 5600,
        category: categoryMap['beauty-and-skincare'],
        brand: 'Forest Essentials',
        features: [
          'Infused with 24K pure Gold Bhasma and Saffron',
          'Cold-pressed virgin sesame oil base',
          'Clinically tested for skin firmness and brightness',
        ],
        affiliatePlatform: 'Myntra',
        affiliateUrl: 'https://www.myntra.com/face-serum/forest-essentials/soundarya-serum/98765/buy?aff=affilify',
        buyButtonText: 'Buy on Myntra',
        isFeatured: false,
        isTrending: true,
        isActive: true,
        tags: ['skincare', 'beauty', 'serum', 'luxury'],
        clickCount: 54,
      },
    ];

    for (const p of productsData) {
      const existingProduct = await Product.findOne({ slug: p.slug });
      if (!existingProduct) {
        await Product.create(p);
        console.log(`[Database Seed] Created Product: ${p.name.substring(0, 35)}...`);
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
