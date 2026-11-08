import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name profileImage role')
      .populate('bookingId', 'bookingNumber status')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { recipientId, bookingId } = req.body;

    // Check if conversation already exists between these participants for this booking
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(bookingId ? { bookingId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        bookingId: bookingId || null,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name profileImage role')
      .populate('bookingId', 'bookingNumber status');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString()) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name profileImage role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId: id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, attachments = [] } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const message = await Message.create({
      conversationId: id,
      senderId: req.user._id,
      text: text || '',
      attachments,
    });

    conversation.lastMessage = {
      text: text || (attachments.length ? '📎 Sent an attachment' : ''),
      senderId: req.user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    const populated = await Message.findById(message._id).populate('senderId', 'name profileImage role');

    // Notify other participant
    const otherParticipantId = conversation.participants.find((p) => p.toString() !== req.user._id.toString());
    if (otherParticipantId) {
      await Notification.create({
        recipientId: otherParticipantId,
        title: `Message from ${req.user.name}`,
        message: text || 'Sent an attachment',
        type: 'chat',
        link: `/customer/messages?conversation=${conversation._id}`,
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
