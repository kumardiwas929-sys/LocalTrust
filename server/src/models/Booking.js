import mongoose from 'mongoose';
import { BOOKING_STATUS, ALL_BOOKING_STATUSES } from '../constants/bookingStatus.js';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/paymentStatus.js';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ALL_BOOKING_STATUSES,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    // Snapshot of service details at the moment of booking
    serviceSnapshot: {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      categoryName: { type: String, default: '' },
      pricingType: { type: String, default: 'fixed' },
      basePrice: { type: Number, default: 0 },
      hourlyRate: { type: Number, default: 0 },
      inspectionFee: { type: Number, default: 0 },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 },
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "09:00 - 11:00 AM"
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ALL_BOOKING_STATUSES,
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    pricingBreakdown: {
      inspectionCharge: { type: Number, default: 0 },
      labourCharge: { type: Number, default: 0 },
      materialCharge: { type: Number, default: 0 },
      additionalCharges: { type: Number, default: 0 },
      additionalChargesReason: { type: String, default: '' },
      totalAmount: { type: Number, required: true, default: 0 },
      priceApprovedByCustomer: { type: Boolean, default: true },
    },
    pendingPriceChange: {
      proposedTotal: { type: Number },
      proposedLabour: { type: Number },
      proposedMaterial: { type: Number },
      proposedAdditional: { type: Number },
      reason: { type: String },
      requestedAt: { type: Date },
      status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    },
    statusHistory: [statusHistorySchema],
    cancellationReason: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to generate human-readable reference number
bookingSchema.statics.generateBookingNumber = function () {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LT-${dateStr}-${randomStr}`;
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
