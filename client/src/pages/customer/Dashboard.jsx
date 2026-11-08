import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Search,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/bookings/my')
      .then((res) => {
        if (res?.data) setBookings(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) =>
    ['pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'awaiting_approval'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const disputedBookings = bookings.filter((b) => b.status === 'disputed');

  // Check if there is an active journey right now
  const enRouteBooking = bookings.find((b) => b.status === 'on_the_way');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Confirmation</Badge>;
      case 'accepted':
        return <Badge variant="info">Accepted</Badge>;
      case 'on_the_way':
        return <Badge variant="teal">Technician On The Way</Badge>;
      case 'arrived':
        return <Badge variant="teal">Arrived at Site</Badge>;
      case 'in_progress':
        return <Badge variant="info">Work In Progress</Badge>;
      case 'awaiting_approval':
        return <Badge variant="purple">WorkProof Ready for Review</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger">Under Dispute</Badge>;
      default:
        return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-teal-200">Customer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 max-w-xl mt-1 leading-relaxed">
            Manage your verified service bookings, track live technician arrivals, and review photo WorkProof™.
          </p>
        </div>

        <Link to="/services">
          <Button variant="secondary" size="md" icon={Search} className="rounded-full shadow-lg">
            Book New Service
          </Button>
        </Link>
      </div>

      {/* Live En Route Journey Alert Banner */}
      {enRouteBooking && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Live Journey in Progress: {enRouteBooking.providerId?.businessName} is on the way!
              </p>
              <p className="text-xs text-emerald-700">
                Booking #{enRouteBooking.bookingNumber} for {enRouteBooking.serviceSnapshot?.name}
              </p>
            </div>
          </div>
          <Link to={`/customer/tracking/${enRouteBooking._id}`}>
            <Button variant="primary" size="sm" icon={Navigation}>
              Open Live GPS Map
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Bookings</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{activeBookings.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled or en route</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed Jobs</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{completedBookings.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified WorkProof sign-off</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">All Time Bookings</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{totalBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Total service history</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Open Disputes</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{disputedBookings.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Tickets under review</span>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Service Bookings</h2>
            <p className="text-xs text-slate-500">View progress status and technician details</p>
          </div>
          <Link to="/customer/bookings" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400 animate-pulse">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-slate-500">You haven't placed any bookings yet.</p>
            <Link to="/services">
              <Button variant="primary" size="sm">
                Explore Services
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        #{booking.bookingNumber}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {booking.serviceSnapshot?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.providerId?.businessName} • {new Date(booking.scheduledDate).toLocaleDateString()} ({booking.timeSlot})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-extrabold text-navy-900">
                    ₹{booking.pricingBreakdown?.totalAmount}
                  </span>
                  <Link to={`/customer/bookings/${booking._id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
