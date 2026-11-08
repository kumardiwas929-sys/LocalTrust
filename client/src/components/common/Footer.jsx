import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Lock, PhoneCall, CheckCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Pillars Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-navy-800 text-sm">
          <div className="flex items-center gap-4 bg-navy-800/60 p-4 rounded-xl border border-navy-700/60">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Trust Passport™ Verified</h4>
              <p className="text-slate-400 text-xs">Background checked, skill-tested, and identity verified.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-navy-800/60 p-4 rounded-xl border border-navy-700/60">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">WorkProof™ Accountability</h4>
              <p className="text-slate-400 text-xs">Inspect before/after photos and transparent bills before sign-off.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-navy-800/60 p-4 rounded-xl border border-navy-700/60">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Transparent Pricing</h4>
              <p className="text-slate-400 text-xs">No hidden surprises. Labour and material quotes locked upfront.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">LocalTrust</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed">
              Find. Verify. Book. Track. Trust. LocalTrust is India's premier verified home and local service marketplace connecting homeowners with thoroughly verified, certified professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <PhoneCall className="w-4 h-4 text-brand-400" />
              <span>Customer Helpline: 1800-LOCAL-TRUST (Toll Free)</span>
            </div>
          </div>

          {/* Popular Services */}
          <div>
            <h5 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Services</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services?category=electrician" className="hover:text-white transition-colors">Electrician</Link></li>
              <li><Link to="/services?category=plumbing" className="hover:text-white transition-colors">Plumber</Link></li>
              <li><Link to="/services?category=ac-cooling" className="hover:text-white transition-colors">AC & Cooling</Link></li>
              <li><Link to="/services?category=appliance-repair" className="hover:text-white transition-colors">Appliance Repair</Link></li>
              <li><Link to="/services?category=carpentry" className="hover:text-white transition-colors">Carpentry</Link></li>
              <li><Link to="/services?category=home-cleaning" className="hover:text-white transition-colors">Home Cleaning</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Platform</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About LocalTrust</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/become-provider" className="hover:text-white transition-colors">Become a Provider</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Service Directory</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help & Disputes</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Trust & Safety</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Trust Passport Guide</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">WorkProof Guarantee</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-4 border-t border-navy-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} LocalTrust Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/contact" className="hover:text-slate-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
