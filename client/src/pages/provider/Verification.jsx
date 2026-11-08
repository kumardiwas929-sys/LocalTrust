import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { updateProviderProfileData } from '../../redux/slices/authSlice.js';

const ProviderVerification = () => {
  const dispatch = useDispatch();
  const { providerProfile } = useSelector((state) => state.auth);

  const [docType, setDocType] = useState('Government Photo ID');
  const [fileUrl, setFileUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(providerProfile);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        if (res?.data?.providerProfile) {
          setProfile(res.data.providerProfile);
          dispatch(updateProviderProfileData(res.data.providerProfile));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmitDoc = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/providers/documents', {
        docType,
        fileUrl,
      });

      if (res?.data) {
        dispatch(
          showToast({
            type: 'success',
            message: 'Document submitted for LocalTrust administrator review!',
          })
        );
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Submission failed' }));
    } finally {
      setLoading(false);
    }
  };

  const status = profile?.verificationStatus || 'pending';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Identity & Skill Verification</h1>
        <p className="text-xs text-slate-500">
          Upload government-issued credentials to receive the verified Trust Passport™ shield.
        </p>
      </div>

      {/* Current Status Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block mb-1">Current Verification Status:</span>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 capitalize">{status}</h3>
            <Badge variant={status === 'verified' ? 'verified' : status === 'rejected' ? 'danger' : 'warning'}>
              {status}
            </Badge>
          </div>
          {profile?.verificationNotes && (
            <p className="text-xs text-slate-500 mt-1 italic">
              Admin Note: "{profile.verificationNotes}"
            </p>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900">Submit Verification Document</h3>

        <form onSubmit={handleSubmitDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Government Photo ID">National ID / Aadhaar / Passport</option>
              <option value="State Trade License">State Trade License / Wireman License</option>
              <option value="Vocational Skill Certificate">Vocational Training / ITI / HVAC Diploma</option>
              <option value="Police Verification Clearance">Police Clearance Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Image URL / Upload Link *
            </label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200">
            🔒 <strong>Strict Privacy:</strong> Uploaded identification documents are stored on private encrypted storage and reviewed exclusively by authorized LocalTrust compliance administrators. They are never published publicly.
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={loading} icon={Upload}>
            Submit For Review
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProviderVerification;
