import mongoose from 'mongoose';

const followUpRequestSchema = new mongoose.Schema(
  {
    issue: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'in_review', 'resolved'], default: 'pending' },
    resolutionNotes: { type: String, default: '' },
  },
  { _id: true }
);

const serviceWarrantySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
      default: 3,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    terms: {
      type: String,
      default: 'Covers free inspection and rectification for defects in workmanship related to this service.',
    },
    followUpRequests: [followUpRequestSchema],
  },
  {
    timestamps: true,
  }
);

const ServiceWarranty = mongoose.model('ServiceWarranty', serviceWarrantySchema);
export default ServiceWarranty;
