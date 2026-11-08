import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Star, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/providers')
      .then((res) => {
        if (res?.data) setProviders(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Verified Provider Registry</h1>
        <p className="text-xs text-slate-500">
          Directory of registered service companies, master technicians, and verified trade partners.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-4">Business / Trade</th>
                <th className="p-4">Owner Lead</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Completed Jobs</th>
                <th className="p-4">Trust Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading providers...</td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No providers found.</td>
                </tr>
              ) : (
                providers.map((p) => {
                  const isVerified = p.verificationStatus === 'verified';
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                            {p.businessName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.businessName}</p>
                            <p className="text-[11px] text-slate-400">{p.skills?.slice(0, 2).join(', ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{p.userId?.name}</td>
                      <td className="p-4 text-slate-600">{p.experienceYears} Years</td>
                      <td className="p-4 font-bold text-amber-500">
                        ⭐ {p.rating} ({p.reviewCount})
                      </td>
                      <td className="p-4 font-extrabold text-navy-900">{p.completedBookingsCount}</td>
                      <td className="p-4">
                        <Badge variant={isVerified ? 'verified' : 'warning'} showVerifiedIcon={isVerified}>
                          {isVerified ? 'Trust Passport™' : p.verificationStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProviders;
