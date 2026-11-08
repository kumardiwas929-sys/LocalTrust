import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileCheck2, Eye, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { useDispatch } from 'react-redux';

const AdminVerifications = () => {
  const dispatch = useDispatch();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Approval / Rejection modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('Govt ID & Trade credentials verified.');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProviders = () => {
    setLoading(true);
    api
      .get('/admin/providers?status=pending')
      .then((res) => {
        if (res?.data) setProviders(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      setActionLoading(true);
      await api.patch(`/admin/providers/${selectedProvider._id}/verify`, {
        notes: verifyNotes,
      });
      dispatch(showToast({ type: 'success', message: 'Provider verified and Trust Passport™ issued!' }));
      setVerifyModalOpen(false);
      fetchProviders();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Verification failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      setActionLoading(true);
      await api.patch(`/admin/providers/${selectedProvider._id}/reject`, {
        reason: rejectReason,
      });
      dispatch(showToast({ type: 'info', message: 'Verification submission rejected' }));
      setRejectModalOpen(false);
      fetchProviders();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Rejection failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Provider Verification Queue</h1>
          <p className="text-xs text-slate-500">
            Review identity proofs, trade licenses, and background checks before awarding the Trust Passport™ badge.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
          {providers.length} Pending Approval
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading submissions...</div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Verification Queue is Empty</h3>
          <p className="text-xs text-slate-400">All registered service providers have been audited and processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                    {p.businessName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.businessName}</h3>
                    <p className="text-xs text-slate-500">
                      Owner: {p.userId?.name} ({p.userId?.email}) • Exp: {p.experienceYears} Years
                    </p>
                  </div>
                </div>
                <Badge variant="warning">Pending Review</Badge>
              </div>

              {/* Submitted Documents Carousel / Previews */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attached Verification Proofs ({p.verificationDocuments?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.verificationDocuments?.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{doc.docType}</span>
                        <span className="text-[10px] text-slate-400">
                          Uploaded: {new Date(doc.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProvider(p);
                    setRejectModalOpen(true);
                  }}
                >
                  Reject Submission
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => {
                    setSelectedProvider(p);
                    setVerifyModalOpen(true);
                  }}
                >
                  Verify & Issue Trust Passport™
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Approve Provider Verification"
      >
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-xs text-slate-500">
            You are granting official LocalTrust verified status to <strong>{selectedProvider?.businessName}</strong>. This will display the verified badge and update their Trust Score.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Audit Notes *
            </label>
            <textarea
              rows={2}
              required
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Confirm Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Verification Request"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-500">
            Specify the reason for declining <strong>{selectedProvider?.businessName}</strong>'s verification documents (e.g. illegible photocopy, expired trade license).
          </p>
          <textarea
            rows={2}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={actionLoading}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVerifications;
