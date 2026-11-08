import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, DollarSign, Award, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

const BecomeProvider = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-200">
          <Award className="w-4 h-4 text-teal-600" />
          <span>Professional Onboarding</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          Grow Your Service Business with LocalTrust
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Stand out from unverified casual workers. Get certified with LocalTrust Trust Passport™ and connect directly with high-value homeowners looking for trusted professionals.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register">
            <Button variant="teal" size="lg" className="rounded-full px-8 shadow-lg">
              Register as a Service Provider
            </Button>
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Digital Trust Passport™</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Gain an official public credential showing your government certification, verified background, customer ratings, and warranty commitment.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Higher Value Bookings</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Customers on LocalTrust prioritize quality and accountability over cheap fixes, leading to larger ticket sizes and repeat neighborhood clients.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Direct Upfront Payments</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Collect payment instantly via Cash On Service or directly into your bank account without delayed escrow lockups.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
