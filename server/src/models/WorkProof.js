import mongoose from 'mongoose';

const workProofSchema = new mongoose.Schema(
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
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    workDescription: {
      type: String,
      required: [true, 'Work description is required'],
      maxlength: 2000,
    },
    labourCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    materialCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    additionalCharges: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'revision_requested', 'disputed'],
      default: 'pending_review',
      index: true,
    },
    customerNotes: {
      type: String,
      default: '',
    },
    revisionReason: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const WorkProof = mongoose.model('WorkProof', workProofSchema);
export default WorkProof;
