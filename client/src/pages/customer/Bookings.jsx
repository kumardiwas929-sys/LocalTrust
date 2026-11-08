import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, MapPin, Search, Star, AlertTriangle, Navigation } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    api
      .get(`/bookings/my${query}`)
      .then((res) => {
        if (res?.data) setBookings(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'on_the_way', label: 'On The Way' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'awaiting_approval', label: 'Awaiting Sign-off' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Confirmation</Badge>;
      case 'accepted':
        return <Badge variant="info">Accepted</Badge>;
      case 'on_the_way':
        return <Badge variant="teal">On The Way</Badge>;
      case 'arrived':
        return <Badge variant="teal">Arrived</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'awaiting_approval':
        return <Badge variant="purple">WorkProof Sign-off</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger">Disputed</Badge>;
      default:
        return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Service Bookings</h1>
          <p className="text-xs text-slate-500">Track real-time status, photo WorkProof™, and digital bills.</p>
        </div>
        <Link to="/services">
          <Button variant="primary" size="sm" icon={Search}>
            Book New Service
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400 animate-pulse">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description={`There are currently no bookings with status '${statusFilter}'.`}
          actionText="Find Services"
          onAction={() => window.location.assign('/services')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-premium transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    #{booking.bookingNumber}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {booking.serviceSnapshot?.name}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {booking.providerId?.businessName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(booking.scheduledDate).toLocaleDateString()} ({booking.timeSlot})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {booking.address?.city}
                  </span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Quoted Total</span>
                  <span className="text-lg font-extrabold text-navy-900">
                    ₹{booking.pricingBreakdown?.totalAmount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {booking.status === 'on_the_way' && (
                    <Link to={`/customer/tracking/${booking._id}`}>
                      <Button variant="teal" size="sm" icon={Navigation}>
                        Track Live
                      </Button>
                    </Link>
                  )}
                  <Link to={`/customer/bookings/${booking._id}`}>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
