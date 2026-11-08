import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import TrustPassportCard from '../../components/trust/TrustPassportCard.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Noida');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [postalCode, setPostalCode] = useState('201301');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/services/${id}`)
      .then((res) => {
        if (res?.data) {
          setService(res.data);
          if (res.data.providerId?._id) {
            api.get(`/reviews/provider/${res.data.providerId._id}`).then((revRes) => {
              if (revRes?.data) setReviews(revRes.data);
            }).catch(() => {});
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Service not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Prepopulate customer address if available
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setStreet(def.street || '');
      setCity(def.city || 'Noida');
      setStateName(def.state || 'Uttar Pradesh');
      setPostalCode(def.postalCode || '201301');
    }
  }, [user]);

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!street.trim()) {
      setBookingError('Please enter your full service address.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      const res = await api.post('/bookings', {
        serviceId: service._id,
        scheduledDate: new Date(bookingDate).toISOString(),
        timeSlot,
        address: {
          street,
          city,
          state: stateName,
          postalCode,
        },
        notes,
        paymentMethod: 'cash',
      });

      if (res?.data) {
        dispatch(
          showToast({
            type: 'success',
            message: `Booking #${res.data.bookingNumber} confirmed successfully!`,
          })
        );
        setBookingModalOpen(false);
        navigate(`/customer/bookings/${res.data._id}`);
      }
    } catch (err) {
      setBookingError(err.message || 'Could not place booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto" />
        <p className="mt-4 text-slate-500 text-sm">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'This service listing may have been unlisted.'}</p>
        <Link to="/services" className="mt-6 inline-block">
          <Button variant="primary">Return to Services</Button>
        </Link>
      </div>
    );
  }

  const provider = service.providerId;
  const isVerified = provider?.verificationStatus === 'verified';
  const inspectionFee = service.inspectionFee || 100;
  const labourCharge = service.pricingType === 'hourly' ? service.hourlyRate : service.basePrice;
  const estimatedTotal = inspectionFee + labourCharge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-brand-600">Services</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-card relative">
            <img
              src={service.photos?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={isVerified ? 'verified' : 'navy'} showVerifiedIcon={isVerified}>
                {isVerified ? 'Trust Passport™ Verified' : 'Registered Provider'}
              </Badge>
            </div>
          </div>

          {/* Title & Meta Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 mb-2">
              <span>{service.categoryId?.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
                {provider?.rating || '5.0'} ({provider?.reviewCount || 0} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mb-4">
              {service.name}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>

          {/* Service Area Highlights */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Service Areas Covered
            </h4>
            <div className="flex flex-wrap gap-2">
              {service.serviceAreas?.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Provider Trust Passport Card */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Service Provider Credentials</h3>
            <TrustPassportCard passport={provider} providerName={provider?.businessName} />
          </div>

          {/* Verified Customer Reviews */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Verified Customer Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No reviews yet for this provider.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                          {rev.customerId?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rev.customerId?.name || 'Verified Customer'}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge variant="verified" showVerifiedIcon>Verified Job</Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pricing & Booking Card (Right Col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/80 shadow-premium p-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Transparent Pricing Breakdown
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-navy-900">₹{service.basePrice}</span>
                <span className="text-xs text-slate-500 font-medium">
                  {service.pricingType === 'hourly' ? '/ hr base rate' : 'starting rate'}
                </span>
              </div>
            </div>

            {/* Breakdown itemization */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Doorstep Inspection Charge:</span>
                <span className="font-semibold text-slate-900">₹{inspectionFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Labour Charge:</span>
                <span className="font-semibold text-slate-900">₹{labourCharge}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Parts & Materials (if required):</span>
                <span>Customer Approved On-Site</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Initial Estimated Total:</span>
                <span className="text-brand-600">₹{estimatedTotal}</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero advance deposit required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WorkProof™ photo review before final payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time GPS live tracking on arrival</span>
              </div>
            </div>

            {/* Book Now Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl py-3 text-base shadow-md"
              onClick={handleOpenBookingModal}
            >
              Book This Service Now
            </Button>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Your Service"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          {bookingError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {bookingError}
            </div>
          )}

          <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/60 text-xs text-brand-900 flex items-center justify-between">
            <span className="font-semibold truncate">{service.name}</span>
            <span className="font-extrabold text-brand-700">₹{estimatedTotal} Est.</span>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Service Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
              <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Noon)</option>
              <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
              <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
              <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Late)</option>
            </select>
          </div>

          {/* Address Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Street Address *
            </label>
            <input
              type="text"
              required
              placeholder="House/Flat number, building, street..."
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Notes or Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring extra 16A switchboard socket..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={bookingLoading}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceDetail;
