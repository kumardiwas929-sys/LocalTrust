import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import api from '../../services/api.js';

const ProviderEarnings = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/providers/me/dashboard'),
      api.get('/bookings/my?status=completed'),
    ])
      .then(([dashRes, bookRes]) => {
        if (dashRes?.data) setDashboardData(dashRes.data);
        if (bookRes?.data) setCompletedBookings(bookRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = dashboardData?.stats?.totalEarnings || 0;
  const pendingEarnings = dashboardData?.stats?.pendingEarnings || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Earnings & Settlements</h1>
        <p className="text-xs text-slate-500">
          Real settlement history from verified completed jobs and customer sign-offs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Completed Earnings</span>
          <p className="text-3xl font-extrabold text-brand-600">₹{totalEarnings}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ✓ 100% Verified Jobs
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Approval</span>
          <p className="text-3xl font-extrabold text-amber-600">₹{pendingEarnings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting client sign-off</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Platform Commission Cut</span>
          <p className="text-3xl font-extrabold text-slate-900">₹0</p>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
            0% Cut • Keep 100% of Labour
          </span>
        </div>
      </div>

      {/* Booking-wise Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Completed Payout History</h3>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading payout records...</div>
        ) : completedBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No completed jobs yet. Complete jobs and submit WorkProof to generate settlements.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedBookings.map((b) => (
              <div key={b._id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800">#{b.bookingNumber}</span>
                  <p className="text-slate-600 font-medium">{b.serviceSnapshot?.name}</p>
                  <p className="text-slate-400 text-[11px]">
                    Client: {b.customerId?.name} • {new Date(b.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-600 block">
                    +₹{b.pricingBreakdown?.totalAmount}
                  </span>
                  <span className="text-[10px] text-slate-400">Cash / Direct Settled</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderEarnings;
