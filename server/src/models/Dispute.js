import mongoose from 'mongoose';
import { DISPUTE_STATUS, ALL_DISPUTE_STATUSES } from '../constants/disputeStatus.js';

const disputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      maxlength: 2000,
    },
    evidenceImages: [{ type: String }],
    status: {
      type: String,
      enum: ALL_DISPUTE_STATUSES,
      default: DISPUTE_STATUS.OPEN,
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.statics.generateDisputeNumber = function () {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DISP-${dateStr}-${rand}`;
};

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
