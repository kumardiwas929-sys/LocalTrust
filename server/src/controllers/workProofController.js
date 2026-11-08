import WorkProof from '../models/WorkProof.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import ServiceWarranty from '../models/ServiceWarranty.js';
import Notification from '../models/Notification.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const submitWorkProof = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const {
      beforePhotos = [],
      afterPhotos = [],
      workDescription,
      labourCost,
      materialCost,
      additionalCharges = 0,
    } = req.body;

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (![BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.AWAITING_APPROVAL].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'WorkProof can only be submitted for bookings currently in progress.',
      });
    }

    const finalAmount =
      (booking.pricingBreakdown.inspectionCharge || 0) +
      Number(labourCost) +
      Number(materialCost) +
      Number(additionalCharges);

    const workProof = await WorkProof.findOneAndUpdate(
      { bookingId: booking._id },
      {
        providerId: profile._id,
        beforePhotos,
        afterPhotos,
        workDescription,
        labourCost: Number(labourCost),
        materialCost: Number(materialCost),
        additionalCharges: Number(additionalCharges),
        finalAmount,
        status: 'pending_review',
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update booking breakdown and status
    booking.pricingBreakdown.labourCharge = Number(labourCost);
    booking.pricingBreakdown.materialCharge = Number(materialCost);
    booking.pricingBreakdown.additionalCharges = Number(additionalCharges);
    booking.pricingBreakdown.totalAmount = finalAmount;
    booking.status = BOOKING_STATUS.AWAITING_APPROVAL;
    booking.statusHistory.push({
      status: BOOKING_STATUS.AWAITING_APPROVAL,
      note: 'Provider submitted WorkProof evidence. Awaiting customer sign-off.',
      updatedBy: req.user._id,
    });

    await booking.save();

    await Notification.create({
      recipientId: booking.customerId,
      title: 'WorkProof Ready for Review',
      message: `${profile.businessName} has completed the service and submitted WorkProof. Please review before/after photos and bill.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({
      success: true,
      message: 'WorkProof submitted successfully. Awaiting customer approval.',
      data: workProof,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkProof = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const workProof = await WorkProof.findOne({ bookingId })
      .populate('providerId', 'businessName rating')
      .populate('bookingId', 'bookingNumber status pricingBreakdown');

    if (!workProof) {
      return res.status(404).json({ success: false, message: 'WorkProof not found for this booking.' });
    }

    res.json({ success: true, data: workProof });
  } catch (err) {
    next(err);
  }
};

export const approveWorkProof = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const workProof = await WorkProof.findOne({ bookingId });
    if (!workProof) {
      return res.status(404).json({ success: false, message: 'WorkProof not found.' });
    }

    workProof.status = 'approved';
    workProof.approvedAt = new Date();
    await workProof.save();

    booking.status = BOOKING_STATUS.COMPLETED;
    booking.statusHistory.push({
      status: BOOKING_STATUS.COMPLETED,
      note: 'Customer approved WorkProof and confirmed job completion.',
      updatedBy: req.user._id,
    });
    await booking.save();

    // Increment completed bookings count for provider
    const provider = await ProviderProfile.findById(booking.providerId);
    if (provider) {
      provider.completedBookingsCount = (provider.completedBookingsCount || 0) + 1;
      await provider.save();

      // If provider offers warranty, create warranty record
      if (provider.warrantyOffered?.isOffered) {
        const durationMonths = provider.warrantyOffered.durationMonths || 3;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

        await ServiceWarranty.create({
          bookingId: booking._id,
          providerId: provider._id,
          customerId: booking.customerId,
          description: provider.warrantyOffered.description || 'Standard workmanship warranty',
          durationMonths,
          startDate: new Date(),
          expiryDate,
          terms: 'Includes free follow-up inspection and correction of any workmanship issues.',
        });
      }

      await Notification.create({
        recipientId: provider.userId,
        title: 'Job Completed & Approved! 🎉',
        message: `Customer approved WorkProof for booking #${booking.bookingNumber}. Payment of ₹${booking.pricingBreakdown.totalAmount} marked as completed.`,
        type: 'booking',
        link: `/provider/jobs/${booking._id}`,
      });
    }

    res.json({
      success: true,
      message: 'Work approved successfully! Booking marked as completed.',
      data: { booking, workProof },
    });
  } catch (err) {
    next(err);
  }
};

export const requestRevision = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { revisionReason } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const workProof = await WorkProof.findOne({ bookingId });
    if (!workProof) return res.status(404).json({ success: false, message: 'WorkProof not found.' });

    workProof.status = 'revision_requested';
    workProof.revisionReason = revisionReason || 'Customer requested revisions';
    await workProof.save();

    booking.status = BOOKING_STATUS.IN_PROGRESS;
    booking.statusHistory.push({
      status: BOOKING_STATUS.IN_PROGRESS,
      note: `Customer requested revision: ${workProof.revisionReason}`,
      updatedBy: req.user._id,
    });
    await booking.save();

    const provider = await ProviderProfile.findById(booking.providerId);
    if (provider) {
      await Notification.create({
        recipientId: provider.userId,
        title: 'Revision Requested on WorkProof',
        message: `Customer requested revision for booking #${booking.bookingNumber}: ${workProof.revisionReason}`,
        type: 'booking',
        link: `/provider/jobs/${booking._id}`,
      });
    }

    res.json({
      success: true,
      message: 'Revision request sent to provider.',
      data: workProof,
    });
  } catch (err) {
    next(err);
  }
};
