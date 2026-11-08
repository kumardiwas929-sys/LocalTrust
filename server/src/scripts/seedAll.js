import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { seedAdmin } from './seedAdmin.js';
import { seedCategories } from './seedCategories.js';
import { seedDemo } from './seedDemo.js';

const seedAll = async () => {
  console.log('=======================================================');
  console.log('🌱 Starting Full LocalTrust Database Seeding Process');
  console.log('=======================================================');

  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('[SeedAll] Error: Could not establish MongoDB connection.');
      process.exit(1);
    }

    // 1. Seed Admin
    await seedAdmin();

    // 2. Seed Categories
    await seedCategories();

    // 3. Seed Demo Providers, Services, Bookings, Reviews
    await seedDemo();

    console.log('=======================================================');
    console.log('✅ LocalTrust Database Seed Completed Successfully!');
    console.log('=======================================================');
  } catch (err) {
    console.error('[SeedAll] Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAll();
