import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '../constants/verificationStatus.js';

const documentSchema = new mongoose.Schema({
  docType: { type: String, required: true }, // e.g. 'Government ID', 'Trade License', 'Police Verification'
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING },
  rejectionReason: { type: String, default: '' },
}, { _id: true });

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  year: { type: Number },
}, { _id: true });

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business or trade name is required'],
      trim: true,
      maxlength: 120,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    skills: [{ type: String, trim: true }],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    serviceAreas: [{ type: String, trim: true }],
    experienceYears: {
      type: Number,
      min: 0,
      default: 1,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    // Sensitive identity documents - never expose to public
    verificationDocuments: [documentSchema],
    certificates: [certificateSchema],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 5.0,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedBookingsCount: {
      type: Number,
      default: 0,
    },
    repeatCustomerRate: {
      type: Number,
      default: 0, // e.g., 85 (%)
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    warrantyOffered: {
      isOffered: { type: Boolean, default: false },
      durationMonths: { type: Number, default: 0 },
      description: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139],
      },
    },
  },
  {
    timestamps: true,
  }
);

providerProfileSchema.index({ location: '2dsphere' });

// Safe public projection method - strips private docs
providerProfileSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.verificationDocuments;
  return obj;
};

const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
export default ProviderProfile;
