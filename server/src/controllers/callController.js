import CallSession from '../models/CallSession.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const getIceServers = (req, res) => {
  const iceServers = [
    { urls: process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302' },
  ];

  if (process.env.TURN_SERVER_URL) {
    iceServers.push({
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME || '',
      credential: process.env.TURN_CREDENTIAL || '',
    });
  }

  res.json({
    success: true,
    data: {
      iceServers,
      hasTurnConfigured: Boolean(process.env.TURN_SERVER_URL),
    },
  });
};

export const initiateCall = async (req, res, next) => {
  try {
    const { receiverId, bookingId, callType = 'audio' } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    // Verify booking authorization if linked
    if (bookingId) {
      const booking = await Booking.findById(bookingId).populate('providerId');
      if (booking) {
        const isParticipant =
          booking.customerId.toString() === req.user._id.toString() ||
          booking.providerId.userId.toString() === req.user._id.toString() ||
          req.user.role === 'admin';

        if (!isParticipant) {
          return res.status(403).json({ success: false, message: 'Unauthorized to call for this booking.' });
        }
      }
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const session = await CallSession.create({
      callId,
      bookingId: bookingId || null,
      callerId: req.user._id,
      receiverId,
      callType,
      status: 'initiated',
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

export const acceptCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await CallSession.findOne({ callId: id });

    if (!session) return res.status(404).json({ success: false, message: 'Call not found.' });

    session.status = 'accepted';
    session.startedAt = new Date();
    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const rejectCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await CallSession.findOne({ callId: id });

    if (!session) return res.status(404).json({ success: false, message: 'Call not found.' });

    session.status = 'rejected';
    session.endedAt = new Date();
    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const endCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await CallSession.findOne({ callId: id });

    if (!session) return res.status(404).json({ success: false, message: 'Call not found.' });

    session.status = 'ended';
    session.endedAt = new Date();
    if (session.startedAt) {
      session.durationSeconds = Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const getCallHistory = async (req, res, next) => {
  try {
    const calls = await CallSession.find({
      $or: [{ callerId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('callerId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: calls });
  } catch (err) {
    next(err);
  }
};
