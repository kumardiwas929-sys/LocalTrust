import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const CustomerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    api
      .get('/favorites')
      .then((res) => {
        if (res?.data) setFavorites(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (providerId) => {
    try {
      await api.delete(`/favorites/${providerId}`);
      setFavorites((prev) => prev.filter((f) => f.providerId?._id !== providerId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Saved Favorite Providers</h1>
        <p className="text-xs text-slate-500">Quickly re-book your most reliable technicians.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorite providers saved yet"
          description="Click the favorite heart icon on any provider profile to save them here for 1-click repeat bookings."
          actionText="Discover Top Providers"
          onAction={() => window.location.assign('/services')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const provider = fav.providerId;
            if (!provider) return null;

            return (
              <div
                key={fav._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-premium transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                        {provider.businessName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{provider.businessName}</h3>
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {provider.rating || '5.0'} ({provider.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(provider._id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{provider.bio}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.skills?.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="verified" showVerifiedIcon>Trust Passport™</Badge>
                  <Link to="/services">
                    <Button variant="primary" size="sm">
                      Book Again
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerFavorites;
