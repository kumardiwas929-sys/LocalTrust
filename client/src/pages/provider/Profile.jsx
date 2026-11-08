import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Briefcase, Award, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { updateProviderProfileData } from '../../redux/slices/authSlice.js';

const ProviderProfile = () => {
  const dispatch = useDispatch();
  const { providerProfile } = useSelector((state) => state.auth);

  const [businessName, setBusinessName] = useState(providerProfile?.businessName || '');
  const [bio, setBio] = useState(providerProfile?.bio || '');
  const [skills, setSkills] = useState(providerProfile?.skills?.join(', ') || '');
  const [serviceAreas, setServiceAreas] = useState(providerProfile?.serviceAreas?.join(', ') || 'Noida, Delhi NCR');
  const [experienceYears, setExperienceYears] = useState(providerProfile?.experienceYears || 5);
  const [warrantyDescription, setWarrantyDescription] = useState(
    providerProfile?.warrantyOffered?.description || '90-Day Guarantee on workmanship and parts fitting'
  );
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState(
    providerProfile?.warrantyOffered?.durationMonths || 3
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/providers/onboarding', {
        businessName,
        bio,
        skills: skills.split(',').map((s) => s.trim()),
        categories: providerProfile?.categories || [],
        serviceAreas: serviceAreas.split(',').map((s) => s.trim()),
        experienceYears: Number(experienceYears),
        warrantyDescription,
        warrantyDurationMonths: Number(warrantyDurationMonths),
      });

      if (res?.data) {
        dispatch(updateProviderProfileData(res.data));
        dispatch(showToast({ type: 'success', message: 'Provider profile updated!' }));
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Update failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Business Profile & Credentials</h1>
        <p className="text-xs text-slate-500">
          Update the profile details and trade areas visible to prospective clients.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Trade Display Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio & Expertise Summary *
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Trade Experience
              </label>
              <input
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Wiring, Fuse Repair, Inverter..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Areas Covered (comma-separated)
            </label>
            <input
              type="text"
              value={serviceAreas}
              onChange={(e) => setServiceAreas(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Workmanship Warranty Commitment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Warranty Description
                </label>
                <input
                  type="text"
                  value={warrantyDescription}
                  onChange={(e) => setWarrantyDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={warrantyDurationMonths}
                  onChange={(e) => setWarrantyDurationMonths(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfile;
