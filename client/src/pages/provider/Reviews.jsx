import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

const ProviderReviews = () => {
  const { providerProfile } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (providerProfile?._id) {
      api
        .get(`/reviews/provider/${providerProfile._id}`)
        .then((res) => {
          if (res?.data) setReviews(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [providerProfile]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Client Reviews & Ratings</h1>
        <p className="text-xs text-slate-500">
          Authentic feedback from verified completed service bookings.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          No reviews received yet. Complete service bookings to accumulate verified client reviews.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {r.customerId?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{r.customerId?.name}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Badge variant="verified" showVerifiedIcon>Verified Customer</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;
