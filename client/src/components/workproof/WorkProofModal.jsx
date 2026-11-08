import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../../services/api.js';

const WorkProofModal = ({
  isOpen,
  onClose,
  booking,
  workProof,
  isCustomer = false,
  isProvider = false,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'revision' | 'dispute'
  const [revisionReason, setRevisionReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for provider submitting WorkProof
  const [beforePhoto, setBeforePhoto] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80');
  const [afterPhoto, setAfterPhoto] = useState('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80');
  const [workDescription, setWorkDescription] = useState('');
  const [labourCost, setLabourCost] = useState(booking?.pricingBreakdown?.labourCharge || 300);
  const [materialCost, setMaterialCost] = useState(booking?.pricingBreakdown?.materialCharge || 0);

  if (!isOpen) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.patch(`/workproof/${booking._id}/approve`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve WorkProof');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) {
      setError('Please provide a reason for the revision request.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.patch(`/workproof/${booking._id}/revision`, { revisionReason });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to request revision');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReason.trim() || !disputeDescription.trim()) {
      setError('Please fill in both the reason and detailed description.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.post('/disputes', {
        bookingId: booking._id,
        reason: disputeReason,
        description: disputeDescription,
        evidenceImages: workProof?.afterPhotos || [],
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      setError('Please provide a detailed work summary.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.post(`/workproof/${booking._id}`, {
        beforePhotos: [beforePhoto],
        afterPhotos: [afterPhoto],
        workDescription,
        labourCost: Number(labourCost),
        materialCost: Number(materialCost),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit WorkProof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="WorkProof™ Verification & Itemized Bill"
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* PROVIDER SUBMISSION VIEW */}
      {isProvider && !workProof && (
        <form onSubmit={handleProviderSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">
            Submit photographic evidence and itemized bill for customer verification and sign-off.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Description & Actions Taken *
            </label>
            <textarea
              rows={3}
              required
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe repairs completed, parts checked, and tests run..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Before Photo URL
              </label>
              <input
                type="url"
                value={beforePhoto}
                onChange={(e) => setBeforePhoto(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                After Photo URL *
              </label>
              <input
                type="url"
                required
                value={afterPhoto}
                onChange={(e) => setAfterPhoto(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Labour Charges (₹)
              </label>
              <input
                type="number"
                min="0"
                value={labourCost}
                onChange={(e) => setLabourCost(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Materials / Parts Replaced (₹)
              </label>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Submit WorkProof & Request Approval
            </Button>
          </div>
        </form>
      )}

      {/* WORKPROOF REVIEW VIEW */}
      {workProof && (
        <div className="space-y-6">
          {/* Photos Comparison */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Photo Evidence (Before vs After)
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Initial State (Before)</span>
                <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {workProof.beforePhotos?.[0] ? (
                    <img
                      src={workProof.beforePhotos[0]}
                      alt="Before work"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                      No photo provided
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Finished Result (After)
                </span>
                <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-500/40 shadow-xs">
                  {workProof.afterPhotos?.[0] ? (
                    <img
                      src={workProof.afterPhotos[0]}
                      alt="After work"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                      Photo attached
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Technician's Work Summary
            </h5>
            <p className="text-sm text-slate-700 leading-relaxed">{workProof.workDescription}</p>
          </div>

          {/* Transparent Itemized Bill */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Itemized Cost Breakdown
            </h5>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-slate-50 text-slate-600">
                <span>Inspection & Diagnosis Charge</span>
                <span className="font-medium text-slate-800">
                  ₹{booking?.pricingBreakdown?.inspectionCharge || 0}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-slate-600">
                <span>Certified Labour / Service Charge</span>
                <span className="font-medium text-slate-800">₹{workProof.labourCost || 0}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-slate-600">
                <span>Materials & Spare Parts</span>
                <span className="font-medium text-slate-800">₹{workProof.materialCost || 0}</span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-brand-50/50 font-bold text-slate-900 text-base">
                <span>Total Amount Due</span>
                <span className="text-brand-600">₹{workProof.finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Action Mode: Review / Revision / Dispute */}
          {isCustomer && booking?.status === 'awaiting_approval' && (
            <div className="pt-4 border-t border-slate-200">
              {activeTab === 'review' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('revision')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
                    >
                      Request Correction
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => setActiveTab('dispute')}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium underline"
                    >
                      Raise a Dispute
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={onClose}>
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApprove}
                      isLoading={loading}
                      icon={ShieldCheck}
                    >
                      Approve & Complete Booking
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'revision' && (
                <div className="space-y-3">
                  <h6 className="text-sm font-semibold text-slate-800">Request Work Revision</h6>
                  <textarea
                    rows={2}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Specify what needs adjustments or rectification before approval..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('review')}>
                      Back
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRequestRevision}
                      isLoading={loading}
                    >
                      Send Revision Request
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'dispute' && (
                <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Open a Formal Dispute Ticket</span>
                  </div>
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Brief reason (e.g. Incomplete work, damaged property, incorrect billing)"
                    className="w-full px-3 py-2 text-sm border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  />
                  <textarea
                    rows={3}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Provide full details of the issue. LocalTrust admin will mediate and review evidence."
                    className="w-full px-3 py-2 text-sm border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('review')}>
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRaiseDispute}
                      isLoading={loading}
                    >
                      Submit Formal Dispute
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default WorkProofModal;
