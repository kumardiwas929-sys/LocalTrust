import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review bookings you placed.' });
    }

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Only completed services are eligible for verified reviews.',
      });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating: Number(rating),
      comment,
      isVerifiedBooking: true,
    });

    booking.isReviewed = true;
    await booking.save();

    // Recalculate provider rating
    const allReviews = await Review.find({ providerId: booking.providerId, isHidden: false });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ProviderProfile.findByIdAndUpdate(booking.providerId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    const populated = await Review.findById(review._id)
      .populate('customerId', 'name profileImage')
      .populate('providerId', 'businessName');

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully. Thank you for your feedback!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const getProviderReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ providerId: id, isHidden: false })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate('providerId', 'businessName rating')
      .populate('bookingId', 'bookingNumber scheduledDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    review.reportCount = (review.reportCount || 0) + 1;
    if (review.reportCount >= 3) {
      review.isModerated = true; // Flaggable for admin review
    }
    await review.save();

    res.json({ success: true, message: 'Review reported for moderation.' });
  } catch (err) {
    next(err);
  }
};
