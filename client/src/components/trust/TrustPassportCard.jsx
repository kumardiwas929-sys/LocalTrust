import React from 'react';
import {
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle,
  Star,
  RotateCcw,
  ShieldAlert,
  Info,
} from 'lucide-react';
import Badge from '../common/Badge.jsx';

const TrustPassportCard = ({ passport, providerName = 'Verified Professional' }) => {
  if (!passport) return null;

  const isVerified = passport.verificationStatus === 'verified';

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-brand-50/30 rounded-2xl border border-brand-200/60 p-6 shadow-premium relative overflow-hidden">
      {/* Decorative Stamp */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand-500/5 rounded-full flex items-center justify-center border border-brand-500/10 pointer-events-none">
        <ShieldCheck className="w-16 h-16 text-brand-600/15" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Trust Passport™</h4>
            <Badge variant="verified" showVerifiedIcon>
              {isVerified ? 'Fully Verified' : 'Under Verification'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">Official LocalTrust Credential & Reliability Audit</p>
        </div>

        {passport.trustScore !== undefined && (
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-brand-600">{passport.trustScore}</span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</span>
          </div>
        )}
      </div>

      {/* Trust Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {/* Verification Status */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Govt ID & Background</span>
          </div>
          <p className="text-sm font-bold text-slate-800">
            {isVerified ? 'Verified & Cleared' : 'Pending Review'}
          </p>
        </div>

        {/* Experience */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Award className="w-4 h-4 text-brand-600" />
            <span>Experience</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{passport.experienceYears || 1}+ Years On Record</p>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span>Verified Bookings</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{passport.completedBookings || 0} Finished</p>
        </div>

        {/* Rating */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Customer Rating</span>
          </div>
          <p className="text-sm font-bold text-slate-800">
            {passport.rating || 5.0} <span className="text-xs font-normal text-slate-400">({passport.reviewCount || 0} reviews)</span>
          </p>
        </div>

        {/* Repeat Customer Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span>Repeat Customers</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{passport.repeatCustomerRate || 90}% Retention</p>
        </div>

        {/* Warranty */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Warranty Offered</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">
            {passport.warrantyOffered?.isOffered
              ? `${passport.warrantyOffered.durationMonths} Months Coverage`
              : 'Standard Inspection'}
          </p>
        </div>
      </div>

      {/* Methodology Disclaimer */}
      <div className="flex items-start gap-2 bg-slate-100/80 p-3 rounded-xl text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Trust Score Methodology:</strong> Computed directly from verified identity check (25%), customer satisfaction rating (25%), completed service records (25%), repeat retention rate (15%), and explicit workmanship warranty (10%).
        </span>
      </div>
    </div>
  );
};

export default TrustPassportCard;
