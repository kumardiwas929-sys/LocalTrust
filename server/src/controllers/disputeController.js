import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { DISPUTE_STATUS } from '../constants/disputeStatus.js';

export const createDispute = async (req, res, next) => {
  try {
    const { bookingId, reason, description, evidenceImages = [] } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only raise disputes for your own bookings.' });
    }

    const disputeNumber = Dispute.generateDisputeNumber();

    const dispute = await Dispute.create({
      disputeNumber,
      bookingId,
      raisedBy: req.user._id,
      reason,
      description,
      evidenceImages,
      status: DISPUTE_STATUS.OPEN,
    });

    // Update booking status
    booking.status = BOOKING_STATUS.DISPUTED;
    booking.statusHistory.push({
      status: BOOKING_STATUS.DISPUTED,
      note: `Dispute filed by customer (#${disputeNumber}): ${reason}`,
      updatedBy: req.user._id,
    });
    await booking.save();

    // Notify provider
    const provider = await ProviderProfile.findById(booking.providerId);
    if (provider) {
      await Notification.create({
        recipientId: provider.userId,
        title: 'Dispute Filed',
        message: `A dispute (#${disputeNumber}) has been opened for booking #${booking.bookingNumber}. LocalTrust support is reviewing.`,
        type: 'dispute',
        link: `/provider/jobs/${booking._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully. Our Trust & Safety team has received your ticket.',
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyDisputes = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'customer') {
      query.raisedBy = req.user._id;
    } else if (req.user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      if (!profile) return res.json({ success: true, data: [] });
      const providerBookings = await Booking.find({ providerId: profile._id }).select('_id');
      query.bookingId = { $in: providerBookings.map((b) => b._id) };
    }

    const disputes = await Dispute.find(query)
      .populate('bookingId', 'bookingNumber status pricingBreakdown')
      .populate('raisedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: disputes });
  } catch (err) {
    next(err);
  }
};

export const getDisputeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id)
      .populate('bookingId')
      .populate('raisedBy', 'name email phone')
      .populate('resolvedBy', 'name');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }

    res.json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
};

export const updateDisputeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution, adminNotes } = req.body;

    const dispute = await Dispute.findById(id).populate('bookingId');
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }

    if (status) dispute.status = status;
    if (resolution) dispute.resolution = resolution;
    if (adminNotes) dispute.adminNotes = adminNotes;

    if (status === DISPUTE_STATUS.RESOLVED || status === DISPUTE_STATUS.REJECTED) {
      dispute.resolvedBy = req.user._id;
      dispute.resolvedAt = new Date();

      // If resolved, update the booking status back to completed or cancelled
      if (dispute.bookingId) {
        const booking = await Booking.findById(dispute.bookingId._id);
        if (booking && booking.status === BOOKING_STATUS.DISPUTED) {
          booking.status = status === DISPUTE_STATUS.RESOLVED ? BOOKING_STATUS.COMPLETED : BOOKING_STATUS.COMPLETED;
          booking.statusHistory.push({
            status: booking.status,
            note: `Dispute #${dispute.disputeNumber} concluded: ${resolution || status}`,
            updatedBy: req.user._id,
          });
          await booking.save();
        }
      }
    }

    await dispute.save();

    // Notify customer
    await Notification.create({
      recipientId: dispute.raisedBy,
      title: 'Dispute Update',
      message: `Your dispute #${dispute.disputeNumber} has been marked as ${status}. ${resolution || ''}`,
      type: 'dispute',
      link: `/customer/disputes`,
    });

    res.json({
      success: true,
      message: 'Dispute updated successfully.',
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
};
