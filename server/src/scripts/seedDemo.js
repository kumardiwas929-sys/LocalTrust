import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import WorkProof from '../models/WorkProof.js';
import Review from '../models/Review.js';
import LiveLocation from '../models/LiveLocation.js';
import Availability from '../models/Availability.js';
import { ROLES } from '../constants/roles.js';
import { VERIFICATION_STATUS } from '../constants/verificationStatus.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/paymentStatus.js';

export const seedDemo = async () => {
  console.log('[Seed:Demo] Seeding demo marketplace users, providers, services, and bookings...');

  // 1. Create Demo Customer
  let customer = await User.findOne({ email: 'customer@localtrust.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Aarav Patel',
      email: 'customer@localtrust.com',
      password: 'Customer@LocalTrust2026',
      role: ROLES.CUSTOMER,
      phone: '+91 98111 22334',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isEmailVerified: true,
      addresses: [
        {
          label: 'Home',
          street: 'Flat 402, Royal Palms Residency, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201309',
          latitude: 28.6280,
          longitude: 77.3649,
          isDefault: true,
        },
      ],
    });
  }

  // 2. Fetch categories
  const electricianCat = await Category.findOne({ slug: 'electrician' });
  const plumberCat = await Category.findOne({ slug: 'plumbing' });
  const acCat = await Category.findOne({ slug: 'ac-cooling' });
  const carpenterCat = await Category.findOne({ slug: 'carpentry' });

  // 3. Create Demo Providers
  const demoProvidersData = [
    {
      name: 'Rajesh Sharma',
      email: 'rajesh.electrician@localtrust.com',
      password: 'Provider@LocalTrust2026',
      phone: '+91 98222 33445',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      businessName: 'Sharma Electricals & Smart Home Solutions',
      bio: 'Government-certified master electrician with 8+ years of experience in domestic and commercial electrical maintenance, rewiring, and circuit safety.',
      skills: ['Circuit Breakers', 'Short Circuit Diagnosis', 'Wiring Replacement', 'Inverter Setup', 'LED Lighting'],
      categories: electricianCat ? [electricianCat._id] : [],
      serviceAreas: ['Noida', 'Indirapuram', 'East Delhi', 'Greater Noida'],
      experienceYears: 8,
      rating: 4.9,
      reviewCount: 42,
      completedBookingsCount: 156,
      repeatCustomerRate: 94,
      warrantyOffered: {
        isOffered: true,
        durationMonths: 3,
        description: '90-Day LocalTrust Guaranteed Workmanship Warranty on all wiring repairs.',
      },
    },
    {
      name: 'Amit Verma',
      email: 'amit.plumbing@localtrust.com',
      password: 'Provider@LocalTrust2026',
      phone: '+91 98333 44556',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      businessName: 'Verma FastFlow Plumbing Care',
      bio: 'Specialist in concealed water leaks, high pressure motor pumps, bathroom fittings, and quick unclogging solutions.',
      skills: ['Leak Detection', 'Pipe Relining', 'Tap Fixtures', 'Water Motor', 'Geyser Installation'],
      categories: plumberCat ? [plumberCat._id] : [],
      serviceAreas: ['Noida', 'South Delhi', 'Central Delhi'],
      experienceYears: 6,
      rating: 4.8,
      reviewCount: 38,
      completedBookingsCount: 124,
      repeatCustomerRate: 88,
      warrantyOffered: {
        isOffered: true,
        durationMonths: 2,
        description: '60-Day Workmanship Warranty on all joint replacements.',
      },
    },
    {
      name: 'Priya Nair',
      email: 'priya.ac@localtrust.com',
      password: 'Provider@LocalTrust2026',
      phone: '+91 98444 55667',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      businessName: 'CoolBreeze HVAC & Appliance Technicians',
      bio: 'Expert AC technician certified in inverter split AC maintenance, compressor overhaul, PCB diagnosis, and eco-friendly gas charging.',
      skills: ['AC Deep Clean', 'Gas Top-Up', 'PCB Diagnostics', 'Split AC Installation', 'Washing Machine Repair'],
      categories: acCat ? [acCat._id] : [],
      serviceAreas: ['Noida', 'Gurugram', 'South Delhi'],
      experienceYears: 5,
      rating: 4.95,
      reviewCount: 51,
      completedBookingsCount: 180,
      repeatCustomerRate: 96,
      warrantyOffered: {
        isOffered: true,
        durationMonths: 6,
        description: '180-Day Guarantee on cooling efficiency and gas leakage.',
      },
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.carpenter@localtrust.com',
      password: 'Provider@LocalTrust2026',
      phone: '+91 98555 66778',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
      businessName: 'Kumar Modern Woodcraft & Repairs',
      bio: 'Expert carpenter specializing in modular furniture assembly, wardrobe sliding doors, door locks, and custom woodwork.',
      skills: ['Furniture Assembly', 'Door Locks', 'Cabinet Alignment', 'Wood Polishing'],
      categories: carpenterCat ? [carpenterCat._id] : [],
      serviceAreas: ['Noida', 'East Delhi', 'Ghaziabad'],
      experienceYears: 7,
      rating: 4.75,
      reviewCount: 29,
      completedBookingsCount: 89,
      repeatCustomerRate: 82,
      warrantyOffered: {
        isOffered: true,
        durationMonths: 3,
        description: '90-Day Guarantee on door hinges and lock mechanisms.',
      },
    },
  ];

  const createdProviders = [];

  for (const pData of demoProvidersData) {
    let pUser = await User.findOne({ email: pData.email });
    if (!pUser) {
      pUser = await User.create({
        name: pData.name,
        email: pData.email,
        password: pData.password,
        role: ROLES.PROVIDER,
        phone: pData.phone,
        profileImage: pData.profileImage,
        isEmailVerified: true,
        addresses: [
          {
            label: 'Workshop',
            street: 'Shop 12, Main Market',
            city: 'Noida',
            state: 'Uttar Pradesh',
            postalCode: '201301',
          },
        ],
      });
    }

    let profile = await ProviderProfile.findOne({ userId: pUser._id });
    if (!profile) {
      profile = await ProviderProfile.create({
        userId: pUser._id,
        businessName: pData.businessName,
        bio: pData.bio,
        skills: pData.skills,
        categories: pData.categories,
        serviceAreas: pData.serviceAreas,
        experienceYears: pData.experienceYears,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verificationNotes: 'Verified via Govt Trade Certification & Identity Check.',
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        rating: pData.rating,
        reviewCount: pData.reviewCount,
        completedBookingsCount: pData.completedBookingsCount,
        repeatCustomerRate: pData.repeatCustomerRate,
        isAvailable: true,
        warrantyOffered: pData.warrantyOffered,
        verificationDocuments: [
          {
            docType: 'National Identity Proof (Aadhaar)',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
            status: VERIFICATION_STATUS.VERIFIED,
          },
          {
            docType: 'State Trade License & Skill Certificate',
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
            status: VERIFICATION_STATUS.VERIFIED,
          },
        ],
      });
    }

    // Availability
    await Availability.findOneAndUpdate(
      { providerId: profile._id },
      {
        providerId: profile._id,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '08:30',
        endTime: '19:30',
        isTemporarilyUnavailable: false,
      },
      { upsert: true }
    );

    createdProviders.push({ user: pUser, profile });
  }

  const [rajesh, amit, priya, suresh] = createdProviders;

  // 4. Create Services
  const servicesData = [
    {
      providerId: rajesh.profile._id,
      categoryId: electricianCat._id,
      name: 'Full Home Electrical Inspection & Short Circuit Diagnostic',
      description: 'Comprehensive inspection of electrical breaker panel, earth leakage check, socket voltage testing, and isolation of short circuits.',
      pricingType: 'inspection',
      basePrice: 299,
      inspectionFee: 299,
      estimatedDurationMinutes: 60,
      serviceAreas: ['Noida', 'Indirapuram', 'East Delhi'],
      photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'],
    },
    {
      providerId: rajesh.profile._id,
      categoryId: electricianCat._id,
      name: 'Ceiling Fan & Decorative Chandelier Installation',
      description: 'Precision mounting, rod balancing, speed regulator calibration, and heavy fixture anchoring for maximum safety.',
      pricingType: 'fixed',
      basePrice: 350,
      inspectionFee: 100,
      estimatedDurationMinutes: 45,
      serviceAreas: ['Noida', 'Indirapuram'],
      photos: ['https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80'],
    },
    {
      providerId: amit.profile._id,
      categoryId: plumberCat._id,
      name: 'Concealed Water Leakage & Pipe Joint Fix',
      description: 'Non-invasive acoustic leak detection, pipe sealing, tile preservation, and high-pressure testing.',
      pricingType: 'hourly',
      basePrice: 399,
      hourlyRate: 350,
      inspectionFee: 150,
      estimatedDurationMinutes: 90,
      serviceAreas: ['Noida', 'South Delhi'],
      photos: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'],
    },
    {
      providerId: priya.profile._id,
      categoryId: acCat._id,
      name: 'Jet Pump Foam Wash & Comprehensive AC Servicing',
      description: 'High-pressure water jet cleaning of indoor cooling coils and outdoor condenser unit, gas pressure check, and air filter sterilization.',
      pricingType: 'fixed',
      basePrice: 599,
      inspectionFee: 150,
      estimatedDurationMinutes: 75,
      serviceAreas: ['Noida', 'Gurugram', 'South Delhi'],
      photos: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80'],
    },
    {
      providerId: suresh.profile._id,
      categoryId: carpenterCat._id,
      name: 'Door Lock Repair & Ultra-Secure Deadbolt Fitting',
      description: 'Replacement of jammed cylindrical locks, brass deadbolt installation, and precision wooden mortising.',
      pricingType: 'fixed',
      basePrice: 450,
      inspectionFee: 150,
      estimatedDurationMinutes: 60,
      serviceAreas: ['Noida', 'East Delhi'],
      photos: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80'],
    },
  ];

  const createdServices = [];
  for (const s of servicesData) {
    const sDoc = await Service.findOneAndUpdate(
      { providerId: s.providerId, name: s.name },
      { ...s, isActive: true },
      { upsert: true, new: true }
    );
    createdServices.push(sDoc);
  }

  // 5. Seed an Active Journey Booking (Demonstrates Live Location Tracking)
  const activeBookingNumber = 'LT-202611-ACT1';
  let activeBooking = await Booking.findOne({ bookingNumber: activeBookingNumber });
  if (!activeBooking) {
    activeBooking = await Booking.create({
      bookingNumber: activeBookingNumber,
      customerId: customer._id,
      providerId: rajesh.profile._id,
      serviceId: createdServices[0]._id,
      serviceSnapshot: {
        name: createdServices[0].name,
        description: createdServices[0].description,
        categoryName: 'Electrician',
        pricingType: 'inspection',
        basePrice: 299,
        inspectionFee: 299,
      },
      address: customer.addresses[0],
      scheduledDate: new Date(),
      timeSlot: '04:00 PM - 06:00 PM',
      notes: 'Main MCB switch keeps tripping when air conditioner is turned on.',
      status: BOOKING_STATUS.ON_THE_WAY,
      pricingBreakdown: {
        inspectionCharge: 299,
        labourCharge: 0,
        materialCharge: 0,
        totalAmount: 299,
        priceApprovedByCustomer: true,
      },
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, note: 'Booking created', updatedBy: customer._id },
        { status: BOOKING_STATUS.ACCEPTED, note: 'Rajesh accepted request', updatedBy: rajesh.user._id },
        { status: BOOKING_STATUS.ON_THE_WAY, note: 'Rajesh started journey towards customer address', updatedBy: rajesh.user._id },
      ],
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod: PAYMENT_METHOD.CASH,
    });

    // Seed live location for the active booking
    await LiveLocation.create({
      bookingId: activeBooking._id,
      providerId: rajesh.profile._id,
      customerId: customer._id,
      latitude: 28.6220,
      longitude: 77.3550,
      heading: 45,
      speed: 28,
      estimatedArrivalMinutes: 8,
      distanceRemainingKm: 2.1,
      isActive: true,
    });
  }

  // 6. Seed a Completed Booking with WorkProof & Verified Review
  const completedBookingNumber = 'LT-202611-COMP';
  let compBooking = await Booking.findOne({ bookingNumber: completedBookingNumber });
  if (!compBooking) {
    compBooking = await Booking.create({
      bookingNumber: completedBookingNumber,
      customerId: customer._id,
      providerId: priya.profile._id,
      serviceId: createdServices[3]._id,
      serviceSnapshot: {
        name: createdServices[3].name,
        description: createdServices[3].description,
        categoryName: 'AC & Cooling',
        pricingType: 'fixed',
        basePrice: 599,
      },
      address: customer.addresses[0],
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeSlot: '11:00 AM - 01:00 PM',
      notes: 'Need deep cleaning and air filter wash.',
      status: BOOKING_STATUS.COMPLETED,
      pricingBreakdown: {
        inspectionCharge: 150,
        labourCharge: 599,
        materialCharge: 120, // AC filter chemical cleaner
        totalAmount: 869,
        priceApprovedByCustomer: true,
      },
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, note: 'Booking placed', updatedBy: customer._id },
        { status: BOOKING_STATUS.ACCEPTED, note: 'Accepted by Priya', updatedBy: priya.user._id },
        { status: BOOKING_STATUS.ON_THE_WAY, note: 'On the way', updatedBy: priya.user._id },
        { status: BOOKING_STATUS.ARRIVED, note: 'Arrived at site', updatedBy: priya.user._id },
        { status: BOOKING_STATUS.IN_PROGRESS, note: 'Cleaning started', updatedBy: priya.user._id },
        { status: BOOKING_STATUS.AWAITING_APPROVAL, note: 'WorkProof submitted', updatedBy: priya.user._id },
        { status: BOOKING_STATUS.COMPLETED, note: 'Customer approved work and bill', updatedBy: customer._id },
      ],
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      paymentMethod: PAYMENT_METHOD.CASH,
      isReviewed: true,
    });

    // Seed WorkProof
    await WorkProof.create({
      bookingId: compBooking._id,
      providerId: priya.profile._id,
      beforePhotos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      ],
      afterPhotos: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
      ],
      workDescription: 'Completed full jet water foam wash on indoor blower wheel and outdoor unit. Cleaned air filters and checked cooling temperature (dropped from 26°C down to crisp 18°C). Sealed gas gauge valve.',
      labourCost: 599,
      materialCost: 120,
      additionalCharges: 0,
      finalAmount: 869,
      status: 'approved',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7200000),
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7800000),
    });

    // Seed Verified Review
    await Review.create({
      bookingId: compBooking._id,
      customerId: customer._id,
      providerId: priya.profile._id,
      rating: 5,
      comment: 'Outstanding service by Priya! Extremely professional, arrived right on time with all protective equipment. The before and after photos in WorkProof showed the difference clearly. AC cooling is back to brand new!',
      isVerifiedBooking: true,
    });
  }

  console.log('[Seed:Demo] Seed completed successfully!');
  console.log('   Demo Customer: customer@localtrust.com / Customer@LocalTrust2026');
  console.log('   Demo Provider 1: rajesh.electrician@localtrust.com / Provider@LocalTrust2026');
  console.log('   Demo Provider 2: priya.ac@localtrust.com / Provider@LocalTrust2026');
};

if (process.argv[1]?.endsWith('seedDemo.js')) {
  (async () => {
    await connectDB();
    await seedDemo();
    await mongoose.connection.close();
    process.exit(0);
  })();
}
