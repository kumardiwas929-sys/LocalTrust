import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Navigation,
  Camera,
  FileCheck2,
  Lock,
  PhoneCall,
  CheckCircle,
} from 'lucide-react';
import Button from '../../components/common/Button.jsx';

const HowItWorks = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          How LocalTrust Protects Every Service
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Unlike legacy directories that list unverified phone numbers, LocalTrust is built on an end-to-end framework of Trust Passports™, Live Journey GPS, and photographic WorkProof™ sign-offs.
        </p>
      </div>

      {/* 4 Pillars of the Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pillar 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-xl font-bold text-navy-900">Search & Inspect Trust Passports™</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every service professional has a public Trust Passport showing verified government IDs, years of trade experience, verified customer ratings, repeat hire rates, and explicit workmanship warranties.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identity and police record verification check</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Transparent hourly and inspection fee estimates</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-xl font-bold text-navy-900">Live Journey Tracking on Interactive Map</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            When your assigned technician clicks "Start Journey", our real-time GPS stream activates. Watch their vehicle progress toward your location with dynamic distance and estimated arrival calculations.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Location shared strictly during active confirmed journeys</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>In-app encrypted audio/video calling without sharing phone numbers</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-xl font-bold text-navy-900">WorkProof™ Accountability System</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Before any job can be completed, the technician must submit high-resolution before-and-after photos, a detailed work description, and an itemized breakdown of labour and material costs.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Side-by-side photographic comparison of repaired components</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Customer approves or requests revisions before any final bill is paid</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h3 className="text-xl font-bold text-navy-900">Digital Warranty & Dispute Guarantee</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Upon your digital sign-off, a permanent service warranty certificate is generated. If any defect or issue arises within the warranty period, raise a ticket or dispute with 1 click.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>24/7 Admin mediation and evidence inspection</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Only verified completed customers can submit public reviews</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link to="/services">
          <Button variant="primary" size="lg" className="rounded-full px-8">
            Browse Verified Services
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
