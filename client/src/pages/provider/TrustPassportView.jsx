import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, Award, CheckCircle, Star } from 'lucide-react';
import api from '../../services/api.js';
import TrustPassportCard from '../../components/trust/TrustPassportCard.jsx';

const TrustPassportView = () => {
  const { providerProfile } = useSelector((state) => state.auth);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (providerProfile?._id) {
      api
        .get(`/providers/${providerProfile._id}/trust-passport`)
        .then((res) => {
          if (res?.data) setPassport(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [providerProfile]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Trust Passport™</h1>
        <p className="text-xs text-slate-500">
          This verifiable digital passport is prominently featured on all your listed services.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading Trust Passport...</div>
      ) : (
        <TrustPassportCard passport={passport} providerName={providerProfile?.businessName} />
      )}
    </div>
  );
};

export default TrustPassportView;
