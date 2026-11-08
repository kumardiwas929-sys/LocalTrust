import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import { ROLES } from '../constants/roles.js';

export const seedAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'LocalTrust Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@localtrust.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@LocalTrust2026';

  console.log(`[Seed:Admin] Checking admin account: ${adminEmail}...`);

  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.role = ROLES.ADMIN;
    admin.isActive = true;
    admin.isEmailVerified = true;
    admin.password = adminPassword; // Will be hashed by pre-save
    await admin.save();
    console.log(`[Seed:Admin] Existing admin user updated.`);
  } else {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: ROLES.ADMIN,
      phone: '+91 98765 43210',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`[Seed:Admin] Admin user created successfully.`);
  }

  return admin;
};

// If run directly
if (process.argv[1]?.endsWith('seedAdmin.js')) {
  (async () => {
    await connectDB();
    await seedAdmin();
    await mongoose.connection.close();
    process.exit(0);
  })();
}
