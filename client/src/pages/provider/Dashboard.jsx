import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/providers/me/dashboard'), api.get('/bookings/my')])
      .then(([dashRes, jobsRes]) => {
        if (dashRes?.data) setDashboardData(dashRes.data);
        if (jobsRes?.data) setJobs(jobsRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboardData?.stats || {
    totalBookings: 0,
    newRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 5.0,
    reviewCount: 0,
    verificationStatus: 'pending',
  };

  const isVerified = stats.verificationStatus === 'verified';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
              Service Professional Center
            </span>
            <Badge variant={isVerified ? 'verified' : 'warning'} showVerifiedIcon={isVerified}>
              {isVerified ? 'Trust Passport™ Verified' : 'Verification Under Review'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {dashboardData?.profile?.businessName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track confirmed incoming service requests, submit photographic WorkProof™, and monitor real earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/provider/jobs">
            <Button variant="primary" size="md">
              View Active Jobs ({stats.activeJobs})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">New Requests</span>
            <CalendarCheck className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{stats.newRequests}</p>
          <span className="text-[11px] text-brand-600 font-semibold mt-1 block">Awaiting Acceptance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Jobs</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{stats.activeJobs}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">In progress or en route</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{stats.completedJobs}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">WorkProof Approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Earnings</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">₹{stats.totalEarnings}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Paid in full</span>
        </div>
      </div>

      {/* Incoming Requests & Active Jobs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Assigned Jobs</h2>
            <p className="text-xs text-slate-500">Manage journey arrival, work execution, and WorkProof submission</p>
          </div>
          <Link to="/provider/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No booking requests yet. Ensure your listed services are active!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">#{job.bookingNumber}</span>
                    <Badge variant="navy">{job.status}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{job.serviceSnapshot?.name}</h4>
                  <p className="text-xs text-slate-500">
                    Client: {job.customerId?.name} • {job.address?.city} • Date: {new Date(job.scheduledDate).toLocaleDateString()} ({job.timeSlot})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-navy-900 text-sm">
                    ₹{job.pricingBreakdown?.totalAmount}
                  </span>
                  <Link to={`/provider/jobs`}>
                    <Button variant="primary" size="sm">
                      Manage Job
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

export default ProviderDashboard;
