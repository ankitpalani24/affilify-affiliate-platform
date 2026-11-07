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

    this.products = [];
    this.clicks = [];
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export const memoryStore = new InMemoryStore();
