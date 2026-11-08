import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Sparkles,
  Award,
  PhoneCall,
  Camera,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Noida');

  useEffect(() => {
    // Fetch categories and featured services
    api.get('/categories').then((res) => {
      if (res?.data) setCategories(res.data);
    }).catch(() => {});

    api.get('/services/featured').then((res) => {
      if (res?.data) setFeaturedServices(res.data);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(selectedLocation)}`);
  };

  const categoryIcons = {
    Zap,
    Droplets,
    Wind,
    Hammer,
    Sparkles,
  };

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/70 text-brand-800 text-xs font-bold tracking-wide uppercase mb-6 border border-brand-200/60 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Find. Verify. Book. Track. Trust.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-tight mb-6">
              Book Verified Local Experts With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                Guaranteed Trust
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Every electrician, plumber, and technician is background-checked, verified with our
              Trust Passport™, and accountable through photo WorkProof™ before you pay.
            </p>
          </div>

          {/* Service Search Bar */}
          <div className="max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-2xl sm:rounded-full shadow-premium border border-slate-200/80">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              {/* Service query */}
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1 border-b sm:border-b-0 sm:border-r border-slate-200">
                <Search className="w-5 h-5 text-brand-600 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Electrician, AC Repair)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Location Select */}
              <div className="flex items-center gap-2 px-4 py-2 w-full sm:w-56 border-b sm:border-b-0 border-slate-200">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-sm text-slate-700 font-medium focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="Noida">Noida / Greater Noida</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Indirapuram">Indirapuram / Ghaziabad</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto rounded-full px-8">
                Search Pros
              </Button>
            </form>
          </div>

          {/* Quick Badges Under Hero */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Identity & Skill Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Transparent Itemized Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>WorkProof™ Sign-off Before Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">Browse verified professionals by service specialty</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/services?category=${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium hover:border-brand-300 transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW LOCALTRUST WORKS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">How LocalTrust Works</h2>
            <p className="text-sm text-slate-500 mt-2">
              Four steps from booking to verified sign-off with complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card text-center relative">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Find & Compare</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse verified professionals with authentic Trust Passports, transparent rates, and real reviews.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card text-center relative">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Book & Track Live</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick your date and time slot. When the technician starts the journey, watch their live arrival on the map.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card text-center relative">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">WorkProof™ Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Technician submits before/after photos and itemized material and labour breakdown. You verify the work.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card text-center relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Approve & Trust</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Confirm completion, pay securely via Cash or Online, and receive your digital warranty certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKPROOF FEATURE SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-3xl text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-500/30">
                <Camera className="w-4 h-4" />
                <span>Industry First Feature</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                No More Guesswork. Meet WorkProof™
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Most platforms leave you wondering if parts were actually replaced or work was done correctly.
                With LocalTrust WorkProof™, service providers must photograph before-and-after states, itemize every part, and await your digital sign-off.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>High-resolution before and after photo evidence</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>No silent price markups – customer approves all parts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>Digital workmanship warranty certificate issued automatically</span>
                </div>
              </div>
            </div>

            {/* Visual Proof Card Mockup */}
            <div className="bg-navy-800/90 rounded-2xl p-6 border border-navy-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-700">
                <span className="text-xs font-bold uppercase text-slate-400">Live WorkProof Demo</span>
                <Badge variant="verified" showVerifiedIcon>Approved Sign-off</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Before (Damaged wiring)</span>
                  <div className="h-32 rounded-lg bg-navy-950 overflow-hidden border border-navy-700">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-emerald-400 font-semibold">After (Safe terminal)</span>
                  <div className="h-32 rounded-lg bg-navy-950 overflow-hidden border-2 border-emerald-500/50">
                    <img
                      src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=300&q=80"
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-navy-950 p-3 rounded-lg text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Labour: ₹500</span>
                  <span>Materials: ₹150</span>
                </div>
                <div className="flex justify-between font-bold text-brand-400 pt-1 border-t border-navy-800">
                  <span>Total Amount Due:</span>
                  <span>₹650</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED PROVIDERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Featured Verified Services
            </h2>
            <p className="text-sm text-slate-500 mt-1">Book top-rated, certified technicians with locked transparent quotes</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.slice(0, 3).map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <img
                  src={service.photos?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="verified" showVerifiedIcon>Verified Pro</Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>{service.categoryId?.name || 'Home Service'}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {service.providerId?.rating || '5.0'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{service.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{service.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">Starting From</span>
                    <span className="text-lg font-extrabold text-brand-600">₹{service.basePrice}</span>
                  </div>
                  <Link to={`/services/${service._id}`}>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FOR SERVICE PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-navy-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Are You a Certified Local Service Professional?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join LocalTrust to get verified, build an unshakeable digital reputation with Trust Passport™, and receive high-value confirmed bookings without platform commission cuts.
            </p>
          </div>
          <Link to="/become-provider" className="shrink-0">
            <Button variant="teal" size="lg" className="rounded-full px-8 shadow-lg">
              Apply For Verification
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
