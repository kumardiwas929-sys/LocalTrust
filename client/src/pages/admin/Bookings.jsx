import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Clock, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    api
      .get(`/admin/bookings${query}`)
      .then((res) => {
        if (res?.data) setBookings(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const tabs = ['all', 'pending', 'accepted', 'on_the_way', 'in_progress', 'awaiting_approval', 'completed', 'cancelled', 'disputed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Platform Bookings Ledger</h1>
          <p className="text-xs text-slate-500">
            Audit status transitions, bill breakdowns, and execution histories across all marketplace orders.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl capitalize whitespace-nowrap transition-colors ${
              statusFilter === tab
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Service</th>
                <th className="p-4">Total Bill</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No bookings found for this filter.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">#{b.bookingNumber}</td>
                    <td className="p-4 font-semibold text-slate-800">{b.customerId?.name}</td>
                    <td className="p-4 text-slate-700">{b.providerId?.businessName}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{b.serviceSnapshot?.name}</td>
                    <td className="p-4 font-extrabold text-navy-900">₹{b.pricingBreakdown?.totalAmount}</td>
                    <td className="p-4">
                      <Badge variant={b.status === 'completed' ? 'success' : b.status === 'disputed' ? 'danger' : 'navy'}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(b.scheduledDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
