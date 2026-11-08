import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from '../models/Category.js';
import connectDB from '../config/db.js';

export const initialCategories = [
  {
    name: 'Electrician',
    slug: 'electrician',
    description: 'Wiring, switches, fuse repair, lighting installation, appliances, circuit breakers.',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    order: 1,
  },
  {
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Pipe leaks, tap fixtures, water heaters, motor pump repairs, bathroom fittings.',
    icon: 'Droplets',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    order: 2,
  },
  {
    name: 'AC & Cooling',
    slug: 'ac-cooling',
    description: 'AC servicing, gas charging, filter cleanup, installation and cooling diagnostics.',
    icon: 'Wind',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    order: 3,
  },
  {
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Washing machines, microwave ovens, refrigerators, RO water purifiers, chimneys.',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    order: 4,
  },
  {
    name: 'Carpentry',
    slug: 'carpentry',
    description: 'Furniture assembly, door lock repairs, custom cabinetry, wooden polishing.',
    icon: 'Hammer',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    order: 5,
  },
  {
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    description: 'Deep house cleaning, sofa sanitization, bathroom scrubbing, kitchen de-greasing.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    order: 6,
  },
  {
    name: 'Painting & Decor',
    slug: 'painting-decor',
    description: 'Interior wall painting, texture coating, waterproofing, exterior weather coat.',
    icon: 'Paintbrush',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    order: 7,
  },
  {
    name: 'Pest Control',
    slug: 'pest-control',
    description: 'Termite protection, cockroach gel treatment, mosquito fogging, bed bug control.',
    icon: 'ShieldAlert',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80',
    order: 8,
  },
  {
    name: 'Home Tutor',
    slug: 'home-tutor',
    description: 'Mathematics, Science, English, competitive exam prep, personalized home tutoring.',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    order: 9,
  },
];

export const seedCategories = async () => {
  console.log('[Seed:Categories] Upserting service categories...');
  const results = [];
  for (const cat of initialCategories) {
    const upserted = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { ...cat, isActive: true },
      { upsert: true, new: true }
    );
    results.push(upserted);
  }
  console.log(`[Seed:Categories] Seeded ${results.length} categories.`);
  return results;
};

if (process.argv[1]?.endsWith('seedCategories.js')) {
  (async () => {
    await connectDB();
    await seedCategories();
    await mongoose.connection.close();
    process.exit(0);
  })();
}
