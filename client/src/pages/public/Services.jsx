import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);

  // Load categories
  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res?.data) setCategories(res.data);
    }).catch(() => {});
  }, []);

  // Fetch services when query params change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (location) params.set('location', location);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', page.toString());
    params.set('limit', '9');

    api
      .get(`/services?${params.toString()}`)
      .then((res) => {
        if (res?.data) {
          setServices(res.data);
          setMeta(res.meta || { page: 1, totalPages: 1, total: res.data.length });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, selectedCategory, location, verifiedOnly, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Explore Verified Home & Local Services
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {meta.total} certified service listings with transparent rates and Trust Passport™ verification.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search services or repair tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="City or area (e.g. Noida)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div className="sm:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-700 bg-white"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" className="w-full">
              Search
            </Button>
          </div>
        </form>

        {/* Category Pills & Verified Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Verified Only Filter Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Providers Only
            </span>
          </label>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="h-44 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No services match your filters"
          description="Try broadening your search term or switching to another category."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('');
            setLocation('');
            setVerifiedOnly(false);
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const provider = service.providerId;
            const isVerified = provider?.verificationStatus === 'verified';

            return (
              <div
                key={service._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium hover:border-brand-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo */}
                  <div className="h-48 bg-slate-100 overflow-hidden relative">
                    <img
                      src={
                        service.photos?.[0] ||
                        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={isVerified ? 'verified' : 'navy'} showVerifiedIcon={isVerified}>
                        {isVerified ? 'Trust Passport™' : 'Active Pro'}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-brand-600">{service.categoryId?.name}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {provider?.rating || '5.0'} ({provider?.reviewCount || 0})
                      </span>
                    </div>

                    <Link to={`/services/${service._id}`}>
                      <h3 className="font-bold text-slate-900 text-base mb-1.5 hover:text-brand-600 transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Provider miniature */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{provider?.businessName}</span>
                      {provider?.experienceYears && (
                        <span className="text-slate-400">• {provider.experienceYears}+ yrs exp</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer / Pricing & CTA */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        {service.pricingType === 'hourly'
                          ? 'Hourly Rate'
                          : service.pricingType === 'inspection'
                          ? 'Inspection Fee'
                          : 'Fixed Price'}
                      </span>
                      <span className="text-xl font-extrabold text-navy-900">
                        ₹
                        {service.pricingType === 'hourly'
                          ? `${service.hourlyRate}/hr`
                          : service.basePrice}
                      </span>
                    </div>

                    <Link to={`/services/${service._id}`}>
                      <Button variant="primary" size="sm">
                        View & Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-600 font-medium px-3">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Services;
