import LiveLocation from '../models/LiveLocation.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export const startTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile || booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const customerLat = booking.address?.latitude || 28.6139;
    const customerLon = booking.address?.longitude || 77.2090;
    const distanceKm = calculateDistanceKm(latitude || 28.6000, longitude || 77.2000, customerLat, customerLon);
    const estimatedMinutes = Math.max(5, Math.round(distanceKm * 3.5)); // rough city speed calculation

    const tracking = await LiveLocation.findOneAndUpdate(
      { bookingId },
      {
        providerId: profile._id,
        customerId: booking.customerId,
        latitude: latitude || 28.6000,
        longitude: longitude || 77.2000,
        distanceRemainingKm: distanceKm,
        estimatedArrivalMinutes: estimatedMinutes,
        isActive: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Live tracking started.', data: tracking });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude, heading, speed } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile || booking.providerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const customerLat = booking.address?.latitude || 28.6139;
    const customerLon = booking.address?.longitude || 77.2090;
    const distanceKm = calculateDistanceKm(latitude, longitude, customerLat, customerLon);
    const estimatedMinutes = Math.max(2, Math.round(distanceKm * 3.2));

    const tracking = await LiveLocation.findOneAndUpdate(
      { bookingId },
      {
        latitude,
        longitude,
        heading: heading || 0,
        speed: speed || 0,
        distanceRemainingKm: distanceKm,
        estimatedArrivalMinutes: estimatedMinutes,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    res.json({ success: true, data: tracking });
  } catch (err) {
    next(err);
  }
};

export const getLiveTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name phone')
      .populate({
        path: 'providerId',
        select: 'businessName userId rating',
        populate: { path: 'userId', select: 'name phone profileImage' },
      });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Authorization check: Customer, Provider, or Admin
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider = booking.providerId.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view tracking for this booking.' });
    }

    const tracking = await LiveLocation.findOne({ bookingId });

    res.json({
      success: true,
      data: {
        tracking,
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          address: booking.address,
          customer: booking.customerId,
          provider: booking.providerId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const markArrived = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    await LiveLocation.findOneAndUpdate(
      { bookingId },
      { isActive: false, distanceRemainingKm: 0, estimatedArrivalMinutes: 0 }
    );

    res.json({ success: true, message: 'Arrived. Live tracking stopped.' });
  } catch (err) {
    next(err);
  }
};

export const stopTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    await LiveLocation.findOneAndUpdate({ bookingId }, { isActive: false });
    res.json({ success: true, message: 'Live tracking stopped.' });
  } catch (err) {
    next(err);
  }
};
