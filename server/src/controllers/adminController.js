import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Dispute from '../models/Dispute.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import LiveLocation from '../models/LiveLocation.js';
import SupportRequest from '../models/SupportRequest.js';
import Notification from '../models/Notification.js';
import { logAdminAction } from '../services/auditService.js';
import { VERIFICATION_STATUS } from '../constants/verificationStatus.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { DISPUTE_STATUS } from '../constants/disputeStatus.js';
import { ROLES } from '../constants/roles.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      verifiedProviders,
      pendingVerifications,
      totalServices,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      openDisputes,
      paymentsAgg,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.CUSTOMER }),
      User.countDocuments({ role: ROLES.PROVIDER }),
      ProviderProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
      ProviderProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({
        status: {
          $in: [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.ACCEPTED,
            BOOKING_STATUS.ON_THE_WAY,
            BOOKING_STATUS.ARRIVED,
            BOOKING_STATUS.IN_PROGRESS,
            BOOKING_STATUS.AWAITING_APPROVAL,
          ],
        },
      }),
      Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
      Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED }),
      Dispute.countDocuments({ status: { $in: [DISPUTE_STATUS.OPEN, DISPUTE_STATUS.UNDER_REVIEW] } }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = paymentsAgg[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        totalServices,
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        openDisputes,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = isActive;
    await user.save();

    await logAdminAction({
      adminId: req.user._id,
      action: isActive ? 'REACTIVATE_USER' : 'SUSPEND_USER',
      targetType: 'User',
      targetId: id,
      details: { email: user.email, name: user.name, isActive },
      req,
    });

    res.json({
      success: true,
      message: `User account has been ${isActive ? 'reactivated' : 'suspended'}.`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.verificationStatus = status;
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
      ProviderProfile.find(query)
        .populate('userId', 'name email phone profileImage isActive createdAt')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ProviderProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: providers,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const profile = await ProviderProfile.findById(id).populate('userId');
    if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    profile.verificationStatus = VERIFICATION_STATUS.VERIFIED;
    profile.verificationNotes = notes || 'Verified by Admin';
    profile.verifiedAt = new Date();

    // Mark documents verified
    profile.verificationDocuments.forEach((doc) => {
      doc.status = VERIFICATION_STATUS.VERIFIED;
    });

    await profile.save();

    await logAdminAction({
      adminId: req.user._id,
      action: 'VERIFY_PROVIDER',
      targetType: 'ProviderProfile',
      targetId: id,
      details: { businessName: profile.businessName, notes },
      req,
    });

    await Notification.create({
      recipientId: profile.userId._id,
      title: 'Congratulations! Verification Approved 🛡️',
      message: 'Your documents have been verified. Your Trust Passport now proudly displays the verified badge.',
      type: 'verification',
      link: '/provider/trust-passport',
    });

    res.json({
      success: true,
      message: 'Provider verified successfully.',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const profile = await ProviderProfile.findById(id).populate('userId');
    if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    profile.verificationStatus = VERIFICATION_STATUS.REJECTED;
    profile.verificationNotes = reason || 'Documentation does not meet verification requirements';

    profile.verificationDocuments.forEach((doc) => {
      doc.status = VERIFICATION_STATUS.REJECTED;
      doc.rejectionReason = reason || '';
    });

    await profile.save();

    await logAdminAction({
      adminId: req.user._id,
      action: 'REJECT_PROVIDER_VERIFICATION',
      targetType: 'ProviderProfile',
      targetId: id,
      details: { businessName: profile.businessName, reason },
      req,
    });

    await Notification.create({
      recipientId: profile.userId._id,
      title: 'Verification Request Update',
      message: `Your verification submission was not approved: ${reason || 'Incomplete documentation'}. You may re-submit updated documents.`,
      type: 'verification',
      link: '/provider/verification',
    });

    res.json({
      success: true,
      message: 'Provider verification rejected.',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [{ bookingNumber: { $regex: search, $options: 'i' } }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customerId', 'name email phone')
        .populate({
          path: 'providerId',
          select: 'businessName userId',
          populate: { path: 'userId', select: 'name phone' },
        })
        .populate('serviceId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const getDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('bookingId')
      .populate('raisedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: disputes });
  } catch (err) {
    next(err);
  }
};

export const getLiveJourneys = async (req, res, next) => {
  try {
    const journeys = await LiveLocation.find({ isActive: true })
      .populate('customerId', 'name phone')
      .populate({
        path: 'providerId',
        select: 'businessName userId rating',
        populate: { path: 'userId', select: 'name phone' },
      })
      .populate('bookingId', 'bookingNumber status address scheduledDate');

    res.json({ success: true, data: journeys });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 30 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('adminId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const getSupportRequests = async (req, res, next) => {
  try {
    const requests = await SupportRequest.find()
      .populate('userId', 'name email role phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};
