import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Plus } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const CustomerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/disputes/my')
      .then((res) => {
        if (res?.data) setDisputes(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning">Ticket Open</Badge>;
      case 'under_review':
        return <Badge variant="info">Admin Under Review</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Dispute Rejected</Badge>;
      default:
        return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Dispute & Guarantee Tickets</h1>
          <p className="text-xs text-slate-500">
            LocalTrust Trust & Safety mediation for incomplete jobs, damages, or billing discrepancies.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No open disputes"
          description="You currently have no open dispute tickets. If any service fails to meet quality standards, you can raise a ticket directly from the booking screen."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                    #{d.disputeNumber}
                  </span>
                  {getStatusBadge(d.status)}
                </div>
                <span className="text-xs text-slate-400">
                  Opened {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{d.reason}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.description}</p>
              </div>

              {/* Admin Resolution Section if processed */}
              {d.resolution && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Admin Resolution:
                  </span>
                  <p className="text-emerald-800 leading-relaxed">{d.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDisputes;
