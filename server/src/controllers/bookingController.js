import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import LiveLocation from '../models/LiveLocation.js';
import Notification from '../models/Notification.js';
import { BOOKING_STATUS, VALID_STATUS_TRANSITIONS } from '../constants/bookingStatus.js';

export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledDate, timeSlot, address, notes, paymentMethod } = req.body;

    const service = await Service.findById(serviceId).populate('categoryId', 'name');
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Requested service is no longer available.' });
    }

    const provider = await ProviderProfile.findById(service.providerId);
    if (!provider || !provider.isAvailable) {
      return res.status(400).json({ success: false, message: 'Provider is currently unavailable for bookings.' });
    }

    // Prevent duplicate booking for same slot with same provider
    const existingBooking = await Booking.findOne({
      providerId: provider._id,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.IN_PROGRESS] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for this provider. Please select another slot.',
      });
    }

    // Compute estimated price breakdown from service snapshot
    const inspectionCharge = service.inspectionFee || 0;
    const labourCharge = service.pricingType === 'hourly' ? service.hourlyRate : service.basePrice;
    const materialCharge = 0; // Initial estimate
    const totalAmount = inspectionCharge + labourCharge + materialCharge;

    const bookingNumber = Booking.generateBookingNumber();

    const booking = await Booking.create({
      bookingNumber,
      customerId: req.user._id,
      providerId: provider._id,
      serviceId: service._id,
      serviceSnapshot: {
        name: service.name,
        description: service.description,
        categoryName: service.categoryId?.name || 'General',
        pricingType: service.pricingType,
        basePrice: service.basePrice,
        hourlyRate: service.hourlyRate,
        inspectionFee: service.inspectionFee,
      },
      address,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      notes: notes || '',
      paymentMethod: paymentMethod || 'cash',
      pricingBreakdown: {
        inspectionCharge,
        labourCharge,
        materialCharge,
        totalAmount,
        priceApprovedByCustomer: true,
      },
      status: BOOKING_STATUS.PENDING,
      statusHistory: [
        {
          status: BOOKING_STATUS.PENDING,
          note: 'Booking placed by customer',
          updatedBy: req.user._id,
        },
      ],
    });

    // Notify provider
    await Notification.create({
      recipientId: provider.userId,
      title: 'New Service Booking Request',
      message: `You have received a new booking request (#${bookingNumber}) for ${service.name}.`,
      type: 'booking',
      link: `/provider/jobs/${booking._id}`,
      data: { bookingId: booking._id },
    });

    res.status(201).json({
      success: true,
      message: 'Booking placed successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const query = {};

    if (req.user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      if (!profile) return res.json({ success: true, data: [] });
      query.providerId = profile._id;
    } else if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone profileImage')
      .populate({
        path: 'providerId',
        select: 'businessName rating reviewCount verificationStatus userId',
        populate: { path: 'userId', select: 'name phone profileImage' },
      })
      .sort({ scheduledDate: -1, createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('customerId', 'name email phone profileImage')
      .populate({
        path: 'providerId',
        select: 'businessName bio skills rating reviewCount verificationStatus userId experienceYears',
        populate: { path: 'userId', select: 'name phone profileImage' },
      })
      .populate('serviceId', 'name description photos');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role-based access check
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider = booking.providerId.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const transitionBookingStatus = async ({ bookingId, nextStatus, note, userId, reason }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const allowedNext = VALID_STATUS_TRANSITIONS[booking.status] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new Error(`Invalid status transition from '${booking.status}' to '${nextStatus}'.`);
  }

  booking.status = nextStatus;
  booking.statusHistory.push({
    status: nextStatus,
    note: note || `Status updated to ${nextStatus}`,
    updatedBy: userId,
  });

  if (reason) {
    if (nextStatus === BOOKING_STATUS.REJECTED) booking.rejectionReason = reason;
    if (nextStatus === BOOKING_STATUS.CANCELLED) booking.cancellationReason = reason;
  }

  await booking.save();
  return booking;
};

export const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.ACCEPTED,
      note: 'Provider accepted your booking request.',
      userId: req.user._id,
    });

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Booking Accepted',
      message: `Your booking #${booking.bookingNumber} has been accepted by ${profile.businessName}.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({ success: true, message: 'Booking accepted.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.REJECTED,
      note: reason || 'Booking rejected by provider',
      userId: req.user._id,
      reason,
    });

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Booking Update',
      message: `Booking #${booking.bookingNumber} was declined: ${reason || 'Provider unavailable'}`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({ success: true, message: 'Booking rejected.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const startJourney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.ON_THE_WAY,
      note: 'Provider has started the journey to your location.',
      userId: req.user._id,
    });

    // Initialize or activate LiveLocation
    await LiveLocation.findOneAndUpdate(
      { bookingId: booking._id },
      {
        providerId: profile._id,
        customerId: booking.customerId,
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
        isActive: true,
        lastUpdated: new Date(),
        estimatedArrivalMinutes: 20,
      },
      { upsert: true, new: true }
    );

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Provider On The Way!',
      message: `${profile.businessName} has started heading to your address. You can now track live on the map.`,
      type: 'tracking',
      link: `/customer/tracking/${booking._id}`,
    });

    res.json({ success: true, message: 'Journey started.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const markArrived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.ARRIVED,
      note: 'Provider has arrived at customer location.',
      userId: req.user._id,
    });

    // Mark live location tracking inactive on arrival
    await LiveLocation.findOneAndUpdate({ bookingId: booking._id }, { isActive: false });

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Provider Arrived',
      message: `${profile.businessName} has arrived at your address.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({ success: true, message: 'Arrived status recorded.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const startWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.IN_PROGRESS,
      note: 'Provider has started service work.',
      userId: req.user._id,
    });

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Work In Progress',
      message: `Work has begun on your booking #${booking.bookingNumber}.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({ success: true, message: 'Work started.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const requestPriceChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { proposedLabour, proposedMaterial, proposedAdditional = 0, reason } = req.body;
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const proposedTotal =
      (booking.pricingBreakdown.inspectionCharge || 0) +
      Number(proposedLabour) +
      Number(proposedMaterial) +
      Number(proposedAdditional);

    booking.pendingPriceChange = {
      proposedTotal,
      proposedLabour: Number(proposedLabour),
      proposedMaterial: Number(proposedMaterial),
      proposedAdditional: Number(proposedAdditional),
      reason,
      requestedAt: new Date(),
      status: 'pending',
    };

    await booking.save();

    await Notification.create({
      recipientId: booking.customerId,
      title: 'Price Adjustment Request',
      message: `${profile.businessName} requested a price change to ₹${proposedTotal} (${reason}). Please review and approve.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    res.json({
      success: true,
      message: 'Price adjustment submitted for customer approval.',
      data: booking.pendingPriceChange,
    });
  } catch (err) {
    next(err);
  }
};

export const approvePriceChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // boolean
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!booking.pendingPriceChange || booking.pendingPriceChange.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending price adjustment found.' });
    }

    if (approved) {
      booking.pricingBreakdown.labourCharge = booking.pendingPriceChange.proposedLabour;
      booking.pricingBreakdown.materialCharge = booking.pendingPriceChange.proposedMaterial;
      booking.pricingBreakdown.additionalCharges = booking.pendingPriceChange.proposedAdditional;
      booking.pricingBreakdown.additionalChargesReason = booking.pendingPriceChange.reason;
      booking.pricingBreakdown.totalAmount = booking.pendingPriceChange.proposedTotal;
      booking.pricingBreakdown.priceApprovedByCustomer = true;
      booking.pendingPriceChange.status = 'approved';

      booking.statusHistory.push({
        status: booking.status,
        note: `Customer approved price revision to ₹${booking.pricingBreakdown.totalAmount}`,
        updatedBy: req.user._id,
      });
    } else {
      booking.pendingPriceChange.status = 'rejected';
      booking.statusHistory.push({
        status: booking.status,
        note: 'Customer declined price revision request',
        updatedBy: req.user._id,
      });
    }

    await booking.save();

    const provider = await ProviderProfile.findById(booking.providerId);
    await Notification.create({
      recipientId: provider.userId,
      title: approved ? 'Price Revision Approved' : 'Price Revision Declined',
      message: approved
        ? `Customer approved revised quote of ₹${booking.pricingBreakdown.totalAmount}.`
        : 'Customer declined the proposed price adjustment.',
      type: 'booking',
      link: `/provider/jobs/${booking._id}`,
    });

    res.json({
      success: true,
      message: approved ? 'Price revision approved.' : 'Price revision rejected.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    let isProvider = false;
    if (req.user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      isProvider = profile && booking.providerId.toString() === profile._id.toString();
    }

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: BOOKING_STATUS.CANCELLED,
      note: reason || 'Booking cancelled',
      userId: req.user._id,
      reason,
    });

    // Stop any live tracking
    await LiveLocation.findOneAndUpdate({ bookingId: booking._id }, { isActive: false });

    // Notify other party
    const targetUserId = isCustomer
      ? (await ProviderProfile.findById(booking.providerId))?.userId
      : booking.customerId;

    if (targetUserId) {
      await Notification.create({
        recipientId: targetUserId,
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} was cancelled: ${reason || 'No reason provided.'}`,
        type: 'booking',
      });
    }

    res.json({ success: true, message: 'Booking cancelled.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledDate, timeSlot } = req.body;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule a booking that is already in progress or completed.',
      });
    }

    booking.scheduledDate = new Date(scheduledDate);
    booking.timeSlot = timeSlot;
    booking.statusHistory.push({
      status: booking.status,
      note: `Booking rescheduled to ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot})`,
      updatedBy: req.user._id,
    });

    await booking.save();

    const provider = await ProviderProfile.findById(booking.providerId);
    await Notification.create({
      recipientId: provider.userId,
      title: 'Booking Rescheduled',
      message: `Booking #${booking.bookingNumber} was rescheduled to ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot}).`,
      type: 'booking',
      link: `/provider/jobs/${booking._id}`,
    });

    res.json({
      success: true,
      message: 'Booking rescheduled successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
