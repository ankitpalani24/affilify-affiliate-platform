import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { categoriesData } from './seed.js';

// Fallback in-memory storage for offline / zero-config instant dev testing
class InMemoryStore {
  constructor() {
    this.admin = {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Site Administrator',
      email: 'admin@affilify.com',
      passwordHash: bcrypt.hashSync('Admin@123456', 10),
      role: 'superadmin',
    };

    this.categories = categoriesData.map((c, i) => ({
      _id: `64f1a2b3c4d5e6f7a8b9c0${10 + i}`,
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.products = [
      {
        _id: '6ab8fcea2949ff58fe04ba21',
        name: 'Echo Dot (5th Gen) Smart Speaker with Alexa | Deep Bass & Crisp Sound',
        slug: 'echo-dot-5th-gen-smart-speaker-with-alexa-or-deep-bass-and-crisp-sound',
        shortDescription: 'Our best sounding Echo Dot yet with clearer vocals and vibrant sound in any room.',
        description: 'Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room. Just ask Alexa to play music, podcasts, and audiobooks.',
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&auto=format&fit=crop&q=80',
        ],
        price: 4499,
        originalPrice: 5499,
        discountPercentage: 18,
        category: this.categories[1],
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
        rating: 4.8,
        reviewCount: 450,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '6aca0a7c5c80c4a2e4ddb992',
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
        discountPercentage: 23,
        category: this.categories[0],
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
        rating: 4.8,
        reviewCount: 1240,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '6aca0af925e389b92bde301b',
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
        discountPercentage: 26,
        category: this.categories[3],
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
        rating: 4.8,
        reviewCount: 650,
        createdAt: new Date().toISOString(),
      },
    ];

    this.clicks = [
      {
        _id: '64f1a2b3c4d5e6f7a8b9c090',
        product: this.products[0],
        productName: this.products[0].name,
        categoryName: 'Home Decor',
        platform: 'Amazon',
        affiliateUrl: this.products[0].affiliateUrl,
        ip: '127.0.0.1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: '64f1a2b3c4d5e6f7a8b9c091',
        product: this.products[1],
        productName: this.products[1].name,
        categoryName: 'Electronics & Gadgets',
        platform: 'Amazon',
        affiliateUrl: this.products[1].affiliateUrl,
        ip: '127.0.0.1',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export const memoryStore = new InMemoryStore();
