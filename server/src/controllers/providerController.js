import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Service from '../models/Service.js';
import Availability from '../models/Availability.js';
import { uploadMedia } from '../config/cloudinary.js';
import { VERIFICATION_STATUS } from '../constants/verificationStatus.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const onboarding = async (req, res, next) => {
  try {
    const {
      businessName,
      bio,
      skills,
      categories,
      serviceAreas,
      experienceYears,
      warrantyDescription,
      warrantyDurationMonths,
    } = req.body;

    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new ProviderProfile({ userId: req.user._id });
    }

    profile.businessName = businessName;
    profile.bio = bio || profile.bio;
    profile.skills = skills || profile.skills;
    profile.categories = categories || profile.categories;
    profile.serviceAreas = serviceAreas || profile.serviceAreas;
    profile.experienceYears = Number(experienceYears) || profile.experienceYears;

    if (warrantyDescription && warrantyDurationMonths) {
      profile.warrantyOffered = {
        isOffered: true,
        durationMonths: Number(warrantyDurationMonths),
        description: warrantyDescription,
      };
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Provider profile updated successfully.',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getProviderProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findById(id)
      .populate('userId', 'name email phone profileImage createdAt')
      .populate('categories', 'name slug icon');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    // Check if requester is the provider or admin to see full documents
    const isOwnerOrAdmin = req.user && (
      req.user.role === 'admin' ||
      profile.userId._id.toString() === req.user._id.toString()
    );

    const services = await Service.find({ providerId: profile._id, isActive: true });
    const reviews = await Review.find({ providerId: profile._id, isHidden: false })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    const safeData = isOwnerOrAdmin ? profile.toObject() : profile.toPublicProfile();

    res.json({
      success: true,
      data: {
        profile: safeData,
        services,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMeDashboard = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const bookings = await Booking.find({ providerId: profile._id });

    const totalBookings = bookings.length;
    const newRequests = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length;
    const acceptedBookings = bookings.filter((b) => b.status === BOOKING_STATUS.ACCEPTED).length;
    const activeJobs = bookings.filter((b) => [
      BOOKING_STATUS.ON_THE_WAY,
      BOOKING_STATUS.ARRIVED,
      BOOKING_STATUS.IN_PROGRESS,
      BOOKING_STATUS.AWAITING_APPROVAL,
    ].includes(b.status)).length;
    const completedJobs = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    const cancelledBookings = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length;

    // Real earnings calculation from completed bookings
    const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.pricingBreakdown?.totalAmount || 0), 0);
    const pendingEarnings = bookings
      .filter((b) => b.status === BOOKING_STATUS.AWAITING_APPROVAL)
      .reduce((sum, b) => sum + (b.pricingBreakdown?.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          newRequests,
          acceptedBookings,
          activeJobs,
          completedJobs: completedJobs.length,
          cancelledBookings,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          verificationStatus: profile.verificationStatus,
          totalEarnings,
          pendingEarnings,
        },
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadDocuments = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const { docType } = req.body;
    let fileUrl = req.body.fileUrl;

    if (req.file) {
      const uploadRes = await uploadMedia(req.file.path, 'documents');
      fileUrl = uploadRes.url;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Document file is required.' });
    }

    profile.verificationDocuments.push({
      docType: docType || 'Government ID',
      fileUrl,
      status: VERIFICATION_STATUS.PENDING,
    });

    profile.verificationStatus = VERIFICATION_STATUS.PENDING;
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Verification document submitted successfully for admin review.',
      data: profile.verificationDocuments,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    let availability = await Availability.findOne({ providerId: profile._id });
    if (!availability) {
      availability = new Availability({ providerId: profile._id });
    }

    Object.assign(availability, req.body);
    await availability.save();

    if (req.body.isTemporarilyUnavailable !== undefined) {
      profile.isAvailable = !req.body.isTemporarilyUnavailable;
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Availability schedule updated successfully.',
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

export const getTrustPassport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findById(id).populate('userId', 'name profileImage createdAt');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const completedBookings = await Booking.countDocuments({
      providerId: profile._id,
      status: BOOKING_STATUS.COMPLETED,
    });

    // Numerical trust calculation based only on verified platform metrics
    // Base 50 + 20 (if verified) + 15 (rating ratio) + 10 (completed jobs factor) + 5 (warranty)
    const verificationScore = profile.verificationStatus === VERIFICATION_STATUS.VERIFIED ? 25 : 0;
    const ratingScore = Math.min(25, (profile.rating / 5) * 25);
    const completedScore = Math.min(25, completedBookings * 2.5);
    const repeatRateScore = Math.min(15, (profile.repeatCustomerRate / 100) * 15);
    const warrantyScore = profile.warrantyOffered?.isOffered ? 10 : 0;
    const trustScore = Math.round(verificationScore + ratingScore + completedScore + repeatRateScore + warrantyScore);

    res.json({
      success: true,
      data: {
        providerId: profile._id,
        businessName: profile.businessName,
        verificationStatus: profile.verificationStatus,
        experienceYears: profile.experienceYears,
        completedBookings,
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        repeatCustomerRate: profile.repeatCustomerRate,
        warrantyOffered: profile.warrantyOffered,
        trustScore,
        trustMethodology: 'Score (out of 100) calculated from verified identity (25%), customer rating (25%), verified completed jobs (25%), repeat customer rate (15%), and explicit service warranty commitment (10%).',
      },
    });
  } catch (err) {
    next(err);
  }
};
