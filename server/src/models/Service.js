import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: 120,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: 2000,
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'hourly', 'inspection'],
      default: 'fixed',
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },
    inspectionFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 60,
    },
    serviceAreas: [{ type: String, trim: true }],
    photos: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ name: 'text', description: 'text' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
