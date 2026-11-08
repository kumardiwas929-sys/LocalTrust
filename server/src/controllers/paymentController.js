import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/paymentStatus.js';

const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder'
);

export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const amountInRupees = booking.pricingBreakdown.totalAmount;
    const amountInPaise = Math.round(amountInRupees * 100);

    if (!isRazorpayConfigured) {
      // Provide clean response that Cash on Service is active and Online Gateway is awaiting live keys
      return res.json({
        success: true,
        data: {
          isGatewayActive: false,
          fallbackPaymentMethod: PAYMENT_METHOD.CASH,
          amount: amountInRupees,
          currency: 'INR',
          message: 'Online payment gateway is pending live API keys. Cash On Service is enabled and active for this booking.',
          bookingId: booking._id,
        },
      });
    }

    // When Razorpay is active:
    // In production we would do:
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amountInPaise, currency: 'INR', receipt: booking.bookingNumber });
    const dummyOrderId = `order_${Date.now()}`;

    res.json({
      success: true,
      data: {
        isGatewayActive: true,
        orderId: dummyOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod = 'cash' } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (paymentMethod === 'online' && isRazorpayConfigured) {
      // Validate signature
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
      }
    }

    const transactionRef = Payment.generateTransactionRef();

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      amount: booking.pricingBreakdown.totalAmount,
      status: PAYMENT_STATUS.COMPLETED,
      paymentMethod,
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || '',
      transactionRef,
    });

    booking.paymentStatus = PAYMENT_STATUS.COMPLETED;
    booking.paymentMethod = paymentMethod;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully.',
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      if (!profile) return res.json({ success: true, data: [] });
      query.providerId = profile._id;
    }

    const payments = await Payment.find(query)
      .populate('bookingId', 'bookingNumber serviceSnapshot scheduledDate')
      .populate('customerId', 'name email')
      .populate('providerId', 'businessName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};
