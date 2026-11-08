import { verifyAccessToken } from '../config/jwt.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import LiveLocation from '../models/LiveLocation.js';

export const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required for Socket connection'));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid or expired socket token'));
      }

      const user = await User.findById(decoded.userId).select('name email role');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Socket authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket] User connected: ${socket.user.name} (${userId})`);

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    // Join specific booking room
    socket.on('booking:join', ({ bookingId }) => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
      }
    });

    // Join chat conversation room
    socket.on('chat:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Chat message sending via socket
    socket.on('message:send', async ({ conversationId, text, attachments }) => {
      try {
        if (!conversationId || (!text && !attachments?.length)) return;

        const message = await Message.create({
          conversationId,
          senderId: socket.user._id,
          text: text || '',
          attachments: attachments || [],
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: text || 'Sent an attachment',
            senderId: socket.user._id,
            timestamp: new Date(),
          },
        });

        const populated = await Message.findById(message._id).populate('senderId', 'name profileImage role');

        io.to(`conversation:${conversationId}`).emit('message:received', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // WebRTC Signaling Events
    socket.on('call:offer', ({ receiverId, offer, callId, callType }) => {
      io.to(`user:${receiverId}`).emit('call:offer', {
        caller: {
          id: socket.user._id,
          name: socket.user.name,
          role: socket.user.role,
        },
        callId,
        offer,
        callType,
      });
    });

    socket.on('call:answer', ({ callerId, answer, callId }) => {
      io.to(`user:${callerId}`).emit('call:answer', {
        receiverId: socket.user._id,
        callId,
        answer,
      });
    });

    socket.on('call:ice-candidate', ({ targetUserId, candidate, callId }) => {
      io.to(`user:${targetUserId}`).emit('call:ice-candidate', {
        senderId: socket.user._id,
        callId,
        candidate,
      });
    });

    socket.on('call:reject', ({ callerId, callId }) => {
      io.to(`user:${callerId}`).emit('call:reject', {
        receiverId: socket.user._id,
        callId,
      });
    });

    socket.on('call:end', ({ targetUserId, callId }) => {
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('call:end', { callId });
      }
    });

    // Live Tracking Signaling Events
    socket.on('tracking:start', ({ bookingId, latitude, longitude }) => {
      io.to(`booking:${bookingId}`).emit('tracking:started', {
        bookingId,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });

    socket.on('tracking:location-update', async ({ bookingId, latitude, longitude, heading, speed, distanceRemainingKm, estimatedArrivalMinutes }) => {
      // Broadcast to anyone listening on this booking
      io.to(`booking:${bookingId}`).emit('tracking:location-received', {
        bookingId,
        latitude,
        longitude,
        heading,
        speed,
        distanceRemainingKm,
        estimatedArrivalMinutes,
        timestamp: new Date(),
      });

      // Also persist latest location
      await LiveLocation.findOneAndUpdate(
        { bookingId },
        {
          latitude,
          longitude,
          heading: heading || 0,
          speed: speed || 0,
          distanceRemainingKm,
          estimatedArrivalMinutes,
          lastUpdated: new Date(),
        }
      ).catch(() => {});
    });

    socket.on('tracking:arrived', ({ bookingId }) => {
      io.to(`booking:${bookingId}`).emit('tracking:arrived', { bookingId });
    });

    socket.on('tracking:stop', ({ bookingId }) => {
      io.to(`booking:${bookingId}`).emit('tracking:stopped', { bookingId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.name}`);
    });
  });
};
