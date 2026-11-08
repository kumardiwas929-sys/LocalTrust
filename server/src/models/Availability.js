import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      unique: true,
      index: true,
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: {
      type: String,
      default: '09:00', // 24-hr format HH:mm
    },
    endTime: {
      type: String,
      default: '19:00',
    },
    slotDurationMinutes: {
      type: Number,
      default: 120,
    },
    isTemporarilyUnavailable: {
      type: Boolean,
      default: false,
    },
    unavailableReason: {
      type: String,
      default: '',
    },
    unavailableUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;
