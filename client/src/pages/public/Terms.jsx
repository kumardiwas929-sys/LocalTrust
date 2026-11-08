import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <h1 className="text-3xl font-extrabold text-navy-900">LocalTrust Terms & Conditions</h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the LocalTrust platform, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Service Booking & WorkProof™</h2>
          <p>
            All bookings made through LocalTrust are governed by our WorkProof™ workflow. Final payment is due only upon customer inspection and approval of the submitted photographic work summary and transparent bill.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Price Adjustments</h2>
          <p>
            Service providers are strictly prohibited from applying silent price changes or additional charges on-site without prior customer approval through the platform's price revision feature.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Dispute Resolution</h2>
          <p>
            In the event of defective workmanship or billing discrepancies, customers and providers may utilize LocalTrust Dispute Mediation. LocalTrust administrators will inspect photographic WorkProof evidence and audit logs to issue a fair, binding resolution.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
