import React from 'react';
import { ShieldCheck, Target, Award, Users, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-200">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          Bringing Verifiable Trust to Local Home Services
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          LocalTrust was founded to solve a ubiquitous problem: the anxiety and lack of accountability when hiring local service professionals.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Unverified Listings</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Every technician undergoes identity verification, criminal background scrutiny, and trade certification validation before being awarded the Trust Passport™ badge.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Photographic Proof</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Our proprietary WorkProof™ workflow requires before-and-after photographic documentation of all repair work, removing any ambiguity over replacement parts and labour.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Fair Wages, No Commission Cut</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Unlike predatory gig platforms that take 25-30% from hardworking technicians, LocalTrust empowers professionals with honest subscriptions and upfront direct payouts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
