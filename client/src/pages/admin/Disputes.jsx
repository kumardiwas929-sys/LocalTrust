import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Eye, MessageSquare } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { useDispatch } from 'react-redux';

const AdminDisputes = () => {
  const dispatch = useDispatch();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [status, setStatus] = useState('resolved');
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = () => {
    setLoading(true);
    api
      .get('/admin/disputes')
      .then((res) => {
        if (res?.data) setDisputes(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    try {
      setActionLoading(true);
      await api.patch(`/disputes/${selectedDispute._id}/admin`, {
        status,
        resolution,
        adminNotes,
      });
      dispatch(showToast({ type: 'success', message: 'Dispute ticket resolved!' }));
      setResolveModalOpen(false);
      fetchDisputes();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Resolve failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Dispute Mediation Center</h1>
        <p className="text-xs text-slate-500">
          Inspect customer claims, review WorkProof™ evidence, and issue official platform resolutions.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading dispute cases...</div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
          No dispute tickets currently open.
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                    #{d.disputeNumber}
                  </span>
                  <Badge variant={d.status === 'resolved' ? 'success' : d.status === 'open' ? 'warning' : 'danger'}>
                    {d.status}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400">
                  Opened {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{d.reason}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.description}</p>
              </div>

              {/* Claimant details */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex flex-wrap items-center gap-4">
                <span>Raised by: <strong>{d.raisedBy?.name}</strong> ({d.raisedBy?.email})</span>
                <span>•</span>
                <span>Booking: <strong>#{d.bookingId?.bookingNumber}</strong></span>
              </div>

              {/* Admin Resolution if existing */}
              {d.resolution && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900">Recorded Resolution:</span>
                  <p className="text-emerald-800">{d.resolution}</p>
                </div>
              )}

              {/* Action */}
              {d.status !== 'resolved' && d.status !== 'rejected' && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedDispute(d);
                      setStatus('resolved');
                      setResolution('Mediated with customer and provider. Replacement parts approved.');
                      setResolveModalOpen(true);
                    }}
                  >
                    Mediate & Resolve Ticket
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mediate Dispute Ticket"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Decision / Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="resolved">Resolved (In favor of resolution agreement)</option>
              <option value="rejected">Rejected (Dispute claim unsubstantiated)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Public Resolution Summary (Sent to Customer & Provider) *
            </label>
            <textarea
              rows={3}
              required
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Admin Notes (Private)
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal compliance record..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Save Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDisputes;
