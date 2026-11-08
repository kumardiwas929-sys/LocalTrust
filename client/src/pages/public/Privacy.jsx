import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <h1 className="text-3xl font-extrabold text-navy-900">LocalTrust Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            LocalTrust collects personal identification information such as your name, email address, phone number, and service delivery addresses solely for facilitating verified local service connections, live journey navigation, and service warranty records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Provider Identity Documents</h2>
          <p>
            Government-issued identity cards, police clearances, and trade certificates submitted by service providers for Trust Passport™ verification are stored securely on private storage buckets with encrypted access controls. Sensitive identity proofs are strictly confidential and never publicly accessible or exposed to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Live GPS Location Privacy</h2>
          <p>
            Real-time GPS tracking is activated strictly when a service provider clicks "Start Journey" for an accepted booking and is immediately terminated upon arrival at the customer's doorstep or cancellation. We do not track providers or customers continuously in the background.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. In-App Audio & Video Calling</h2>
          <p>
            LocalTrust provides peer-to-peer WebRTC encrypted calling directly between authorized booking participants. No personal telephone numbers are shared or exposed without consent, and calls are never recorded by default.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
