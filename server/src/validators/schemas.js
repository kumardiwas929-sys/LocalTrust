import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.CUSTOMER, ROLES.PROVIDER, ROLES.ADMIN, ROLES.SUPPORT]).default(ROLES.CUSTOMER),
  phone: z.string().optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().default('Home'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  latitude: z.number().optional().default(28.6139),
  longitude: z.number().optional().default(77.2090),
  isDefault: z.boolean().optional().default(false),
});

export const providerOnboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name is required').max(120),
  bio: z.string().max(1000).optional().default(''),
  skills: z.array(z.string()).default([]),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  serviceAreas: z.array(z.string()).min(1, 'At least one service area is required'),
  experienceYears: z.number().min(0).default(1),
  warrantyDescription: z.string().optional().default(''),
  warrantyDurationMonths: z.number().optional().default(0),
});

export const serviceCreateSchema = z.object({
  name: z.string().min(3, 'Service title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Service description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  pricingType: z.enum(['fixed', 'hourly', 'inspection']).default('fixed'),
  basePrice: z.number().min(0, 'Base price must be >= 0'),
  hourlyRate: z.number().min(0).optional().default(0),
  inspectionFee: z.number().min(0).optional().default(0),
  estimatedDurationMinutes: z.number().min(15).optional().default(60),
  serviceAreas: z.array(z.string()).optional().default([]),
  photos: z.array(z.string()).optional().default([]),
});

export const bookingCreateSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid scheduled date is required',
  }),
  timeSlot: z.string().min(1, 'Time slot is required'),
  address: addressSchema,
  notes: z.string().max(500).optional().default(''),
  paymentMethod: z.enum(['cash', 'online']).default('cash'),
});

export const priceChangeRequestSchema = z.object({
  proposedLabour: z.number().min(0),
  proposedMaterial: z.number().min(0),
  proposedAdditional: z.number().min(0).optional().default(0),
  reason: z.string().min(5, 'Reason for price change is required'),
});

export const workProofSubmitSchema = z.object({
  beforePhotos: z.array(z.string()).default([]),
  afterPhotos: z.array(z.string()).min(1, 'At least one completion photo is required'),
  workDescription: z.string().min(10, 'Detailed work summary is required'),
  labourCost: z.number().min(0),
  materialCost: z.number().min(0),
  additionalCharges: z.number().min(0).optional().default(0),
});

export const reviewCreateSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});

export const disputeCreateSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(3, 'Reason is required'),
  description: z.string().min(10, 'Detailed description is required').max(2000),
  evidenceImages: z.array(z.string()).optional().default([]),
});

export const availabilityUpdateSchema = z.object({
  workingDays: z.array(z.string()).min(1, 'At least one working day required'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm (24hr)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm (24hr)'),
  isTemporarilyUnavailable: z.boolean().optional().default(false),
  unavailableReason: z.string().optional().default(''),
});
