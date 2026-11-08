import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  ShieldCheck,
  FileCheck2,
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res?.data) setStats(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const d = stats || {
    totalCustomers: 0,
    totalProviders: 0,
    verifiedProviders: 0,
    pendingVerifications: 0,
    totalServices: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    openDisputes: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-navy-800">
        <div>
          <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
            Executive Control Tower
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Platform Health & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live database telemetry across user accounts, provider verification queues, active journeys, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/verifications">
            <Button variant="teal" size="sm" icon={FileCheck2}>
              Review Verifications ({d.pendingVerifications})
            </Button>
          </Link>
          <Link to="/admin/live-tracking">
            <Button variant="secondary" size="sm" icon={Navigation}>
              Live Journeys
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Customers</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{d.totalCustomers}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered Homeowners</span>
        </div>

        {/* Total Providers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Verified Pros</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{d.verifiedProviders}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {d.totalProviders} Total Registered
          </span>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">{d.totalBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {d.activeBookings} active • {d.completedBookings} finished
          </span>
        </div>

        {/* Total Platform Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Volume</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">₹{d.totalRevenue}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Settled Services</span>
        </div>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Queue Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Pending Verification Submissions</h3>
            <Badge variant="warning">{d.pendingVerifications} Pending</Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review submitted government IDs, police clearances, and vocational certificates to ensure authentic Trust Passports™.
          </p>
          <Link to="/admin/verifications" className="inline-block">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Open Verification Queue
            </Button>
          </Link>
        </div>

        {/* Disputes Queue Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Customer Disputes & Tickets</h3>
            <Badge variant={d.openDisputes > 0 ? 'danger' : 'success'}>
              {d.openDisputes} Open Tickets
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect photographic WorkProof™ evidence, inspect internal technician notes, and resolve warranty disputes.
          </p>
          <Link to="/admin/disputes" className="inline-block">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              Open Dispute Mediation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
