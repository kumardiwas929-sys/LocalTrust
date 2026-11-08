import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck,
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  Video,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FileText,
  Star,
  Navigation,
  DollarSign,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import WorkProofModal from '../../components/workproof/WorkProofModal.jsx';
import { setActiveCall } from '../../redux/slices/callSlice.js';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { getSocket } from '../../services/socket.js';
import { startLocalMedia, getPeerConnection } from '../../services/webrtc.js';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [booking, setBooking] = useState(null);
  const [workProof, setWorkProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [workProofModalOpen, setWorkProofModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = () => {
    api
      .get(`/bookings/${id}`)
      .then((res) => {
        if (res?.data) {
          setBooking(res.data);
          // Try fetching workproof if applicable
          if (['awaiting_approval', 'completed', 'disputed'].includes(res.data.status)) {
            api
              .get(`/workproof/${id}`)
              .then((wpRes) => {
                if (wpRes?.data) setWorkProof(wpRes.data);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => setError(err.message || 'Failed to load booking details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Initiate In-App Call
  const handleInitiateCall = async (callType = 'audio') => {
    if (!booking?.providerId?.userId?._id) return;
    try {
      const receiverId = booking.providerId.userId._id;
      const res = await api.post('/calls/initiate', {
        receiverId,
        bookingId: booking._id,
        callType,
      });

      if (res?.data) {
        const stream = await startLocalMedia(callType);
        const pc = await getPeerConnection();
        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const socket = getSocket();
        socket.emit('call:offer', {
          receiverId,
          offer,
          callId: res.data.callId,
          callType,
        });

        dispatch(
          setActiveCall({
            targetUser: {
              id: receiverId,
              name: booking.providerId.businessName,
              role: 'provider',
            },
            callId: res.data.callId,
            callType,
            status: 'calling',
          })
        );
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Could not initiate call' }));
    }
  };

  // Open Chat
  const handleOpenChat = async () => {
    try {
      const recipientId = booking.providerId.userId._id;
      const res = await api.post('/chat/conversations', {
        recipientId,
        bookingId: booking._id,
      });
      if (res?.data) {
        navigate(`/customer/messages?conversation=${res.data._id}`);
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Could not open conversation' }));
    }
  };

  // Handle Price Change Approval
  const handlePriceApproval = async (approved) => {
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${id}/approve-price`, { approved });
      dispatch(
        showToast({
          type: 'success',
          message: approved ? 'Price change approved' : 'Price adjustment declined',
        })
      );
      fetchBooking();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Action failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Verified Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/reviews', {
        bookingId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      dispatch(showToast({ type: 'success', message: 'Verified review submitted! Thank you.' }));
      setReviewModalOpen(false);
      fetchBooking();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Review failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${id}/cancel`, { reason: cancelReason });
      dispatch(showToast({ type: 'info', message: 'Booking has been cancelled.' }));
      setCancelModalOpen(false);
      fetchBooking();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Cancel failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-slate-700 font-bold">{error || 'Booking not found'}</p>
        <Link to="/customer/bookings">
          <Button variant="outline" size="sm">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'on_the_way', label: 'En Route' },
    { key: 'arrived', label: 'Arrived' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'awaiting_approval', label: 'WorkProof' },
    { key: 'completed', label: 'Completed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === booking.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-3 py-0.5 rounded-lg">
              #{booking.bookingNumber}
            </span>
            <Badge variant="verified" showVerifiedIcon>LocalTrust Shield</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
            {booking.serviceSnapshot?.name}
          </h1>
          <p className="text-xs text-slate-500">
            Booked on {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon={Phone} onClick={() => handleInitiateCall('audio')}>
            Call Audio
          </Button>
          <Button variant="outline" size="sm" icon={Video} onClick={() => handleInitiateCall('video')}>
            Call Video
          </Button>
          <Button variant="primary" size="sm" icon={MessageSquare} onClick={handleOpenChat}>
            Live Chat
          </Button>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card overflow-x-auto">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Service Progress Status
        </h4>
        <div className="flex items-center justify-between min-w-[500px] relative">
          {/* Progress bar background line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-0" />

          {steps.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = booking.status === step.key;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 whitespace-nowrap ${
                    isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Price Revision Alert Banner */}
      {booking.pendingPriceChange?.status === 'pending' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3 text-amber-900">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold">Technician Requested Price Adjustment</h3>
              <p className="text-xs text-amber-700">
                Reason: "{booking.pendingPriceChange.reason}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block">Proposed Labour:</span>
              <span className="font-bold text-slate-800">₹{booking.pendingPriceChange.proposedLabour}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Proposed Materials:</span>
              <span className="font-bold text-slate-800">₹{booking.pendingPriceChange.proposedMaterial}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Additional:</span>
              <span className="font-bold text-slate-800">₹{booking.pendingPriceChange.proposedAdditional || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-brand-600">New Total Quote:</span>
              <span className="font-extrabold text-base text-brand-600">₹{booking.pendingPriceChange.proposedTotal}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriceApproval(false)}
              isLoading={actionLoading}
            >
              Decline Adjustment
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePriceApproval(true)}
              isLoading={actionLoading}
            >
              Approve Revised Price
            </Button>
          </div>
        </div>
      )}

      {/* Live Tracking Shortcut if En Route */}
      {booking.status === 'on_the_way' && (
        <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-300 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Navigation className="w-8 h-8 text-emerald-600 animate-bounce" />
            <div>
              <h3 className="font-bold text-emerald-900 text-base">Technician is Heading to Your Doorstep!</h3>
              <p className="text-xs text-emerald-700">Follow the live route and arrival ETA on the interactive map.</p>
            </div>
          </div>
          <Link to={`/customer/tracking/${booking._id}`}>
            <Button variant="primary" size="sm" icon={Navigation}>
              Open Live GPS Tracker
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid: Details & WorkProof */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left col: Service & Provider details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Professional
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {booking.providerId?.businessName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{booking.providerId?.businessName}</h3>
                  <p className="text-xs text-slate-500">
                    Lead: {booking.providerId?.userId?.name} • ⭐ {booking.providerId?.rating || '5.0'}
                  </p>
                </div>
              </div>
              <Badge variant="verified" showVerifiedIcon>Verified</Badge>
            </div>
          </div>

          {/* Schedule & Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Appointment & Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Scheduled Time</span>
                  <span className="text-slate-600">
                    {new Date(booking.scheduledDate).toLocaleDateString()} ({booking.timeSlot})
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Service Address</span>
                  <span className="text-slate-600">
                    {booking.address?.street}, {booking.address?.city}, {booking.address?.state} {booking.address?.postalCode}
                  </span>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Customer Notes:</span>
                <p className="text-slate-600 italic">"{booking.notes}"</p>
              </div>
            )}
          </div>

          {/* WorkProof Action Card */}
          {['awaiting_approval', 'completed'].includes(booking.status) && (
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-3xl border border-brand-200 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  <h4 className="font-bold text-slate-900 text-base">WorkProof™ Evidence Dossier</h4>
                </div>
                <Badge variant={booking.status === 'completed' ? 'success' : 'purple'}>
                  {booking.status === 'completed' ? 'Sign-Off Complete' : 'Awaiting Your Approval'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect before-and-after photos, technician work notes, and itemized spare parts before final sign-off.
              </p>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setWorkProofModalOpen(true)}
              >
                Inspect WorkProof & Bill
              </Button>
            </div>
          )}

          {/* Verified Review CTA */}
          {booking.status === 'completed' && !booking.isReviewed && (
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 flex items-center justify-between shadow-card">
              <div>
                <h4 className="font-bold text-amber-900 text-sm">How was your service experience?</h4>
                <p className="text-xs text-amber-700">Leave a verified review to help neighbors book with confidence.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setReviewModalOpen(true)}>
                Leave Review
              </Button>
            </div>
          )}
        </div>

        {/* Right col: Quoted Bill Breakdown & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-premium space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transparent Bill Breakdown
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span>Inspection & Travel Charge:</span>
                <span className="font-semibold text-slate-900">
                  ₹{booking.pricingBreakdown?.inspectionCharge || 0}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Certified Labour / Fix:</span>
                <span className="font-semibold text-slate-900">
                  ₹{booking.pricingBreakdown?.labourCharge || 0}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Materials / Spare Parts:</span>
                <span className="font-semibold text-slate-900">
                  ₹{booking.pricingBreakdown?.materialCharge || 0}
                </span>
              </div>
              {booking.pricingBreakdown?.additionalCharges > 0 && (
                <div className="flex justify-between pt-2">
                  <span>Additional Surcharge:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{booking.pricingBreakdown.additionalCharges}
                  </span>
                </div>
              )}
              <div className="pt-3 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-brand-600 text-lg">
                  ₹{booking.pricingBreakdown?.totalAmount}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Payment Method: <strong>Cash On Service</strong> (or in-person digital QR scan).
            </div>

            {/* Cancel Booking Option */}
            {['pending', 'accepted'].includes(booking.status) && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="w-full text-center text-xs text-rose-500 hover:text-rose-700 font-semibold py-2"
              >
                Cancel This Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WorkProof Modal */}
      {workProofModalOpen && (
        <WorkProofModal
          isOpen={workProofModalOpen}
          onClose={() => setWorkProofModalOpen(false)}
          booking={booking}
          workProof={workProof}
          isCustomer={true}
          onSuccess={fetchBooking}
        />
      )}

      {/* Leave Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Submit Verified Service Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <p className="text-xs text-slate-500">
            Your review will display the verified customer badge on the provider's Trust Passport™.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Feedback & Experience *
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How prompt, professional, and clean was the repair work?"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Post Verified Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Service Booking"
      >
        <form onSubmit={handleCancelBooking} className="space-y-4">
          <p className="text-xs text-slate-500">
            Are you sure you want to cancel booking #{booking.bookingNumber}? Please provide a reason.
          </p>
          <textarea
            rows={2}
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (e.g. Schedule change, problem resolved)..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={actionLoading}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingDetail;
