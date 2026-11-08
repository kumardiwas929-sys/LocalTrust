import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Navigation,
  Wrench,
  Camera,
  Phone,
  Video,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import WorkProofModal from '../../components/workproof/WorkProofModal.jsx';
import { setActiveCall } from '../../redux/slices/callSlice.js';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { getSocket } from '../../services/socket.js';
import { startLocalMedia, getPeerConnection } from '../../services/webrtc.js';

const ProviderJobs = () => {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');

  // Modals state
  const [selectedJob, setSelectedJob] = useState(null);
  const [workProofModalOpen, setWorkProofModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [proposedLabour, setProposedLabour] = useState(0);
  const [proposedMaterial, setProposedMaterial] = useState(0);
  const [proposedReason, setProposedReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    const query = statusTab !== 'all' ? `?status=${statusTab}` : '';
    api
      .get(`/bookings/my${query}`)
      .then((res) => {
        if (res?.data) setJobs(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [statusTab]);

  const tabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'New Requests' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'on_the_way', label: 'En Route' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'awaiting_approval', label: 'Awaiting Sign-off' },
    { id: 'completed', label: 'Completed' },
  ];

  // Accept booking
  const handleAccept = async (jobId) => {
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${jobId}/accept`);
      dispatch(showToast({ type: 'success', message: 'Booking accepted!' }));
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Accept failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Reject booking
  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${selectedJob._id}/reject`, { reason: rejectReason });
      dispatch(showToast({ type: 'info', message: 'Booking declined' }));
      setRejectModalOpen(false);
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Reject failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Start Journey (Activates live tracking)
  const handleStartJourney = async (job) => {
    try {
      setActionLoading(true);

      // Attempt browser geolocation or sensible default
      let lat = 28.6220;
      let lng = 77.3550;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          },
          () => {}
        );
      }

      await api.patch(`/bookings/${job._id}/start-journey`, {
        latitude: lat,
        longitude: lng,
      });

      const socket = getSocket();
      socket.emit('tracking:start', {
        bookingId: job._id,
        latitude: lat,
        longitude: lng,
      });

      dispatch(showToast({ type: 'success', message: 'Journey started! Live GPS sharing active.' }));
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Could not start journey' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Arrived
  const handleMarkArrived = async (jobId) => {
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${jobId}/arrived`);
      const socket = getSocket();
      socket.emit('tracking:arrived', { bookingId: jobId });
      dispatch(showToast({ type: 'success', message: 'Arrived at site! GPS tracking stopped.' }));
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Arrival status failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Start Work
  const handleStartWork = async (jobId) => {
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${jobId}/start-work`);
      dispatch(showToast({ type: 'success', message: 'Service work started' }));
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Action failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Price adjustment request
  const handleRequestPriceChange = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setActionLoading(true);
      await api.patch(`/bookings/${selectedJob._id}/price-change`, {
        proposedLabour: Number(proposedLabour),
        proposedMaterial: Number(proposedMaterial),
        reason: proposedReason,
      });
      dispatch(showToast({ type: 'success', message: 'Price revision sent for customer approval' }));
      setPriceModalOpen(false);
      fetchJobs();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Price adjustment failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Call Customer
  const handleCallCustomer = async (job, callType = 'audio') => {
    if (!job?.customerId?._id) return;
    try {
      const receiverId = job.customerId._id;
      const res = await api.post('/calls/initiate', {
        receiverId,
        bookingId: job._id,
        callType,
      });

      if (res?.data) {
        const stream = await startLocalMedia(callType);
        const pc = await getPeerConnection();
        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const socket = getSocket();
        socket.emit('call:offer', {
          receiverId,
          offer,
          callId: res.data.callId,
          callType,
        });

        dispatch(
          setActiveCall({
            targetUser: { id: receiverId, name: job.customerId.name, role: 'customer' },
            callId: res.data.callId,
            callType,
            status: 'calling',
          })
        );
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Call failed' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Job Requests & Schedule</h1>
          <p className="text-xs text-slate-500">
            Accept requests, trigger live journey tracking, and submit photo WorkProof™ for sign-off.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
              statusTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          No jobs found under '{statusTab}'.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                    #{job.bookingNumber}
                  </span>
                  <Badge variant="navy">{job.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Total Quoted:</span>
                  <span className="font-extrabold text-brand-600 text-base">
                    ₹{job.pricingBreakdown?.totalAmount}
                  </span>
                </div>
              </div>

              {/* Service & Client details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{job.serviceSnapshot?.name}</h3>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(job.scheduledDate).toLocaleDateString()} ({job.timeSlot})
                  </p>
                  {job.notes && (
                    <p className="text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                      Note: "{job.notes}"
                    </p>
                  )}
                </div>

                <div className="space-y-1 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{job.customerId?.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCallCustomer(job, 'audio')}
                        className="p-1 text-slate-500 hover:text-brand-600 rounded"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCallCustomer(job, 'video')}
                        className="p-1 text-slate-500 hover:text-brand-600 rounded"
                        title="Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {job.address?.street}, {job.address?.city} {job.address?.postalCode}
                    </span>
                  </p>
                </div>
              </div>

              {/* WORKFLOW ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-medium">
                  Status: <strong>{job.status}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status: Pending */}
                  {job.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setRejectModalOpen(true);
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(job._id)}
                        isLoading={actionLoading}
                      >
                        Accept Booking
                      </Button>
                    </>
                  )}

                  {/* Status: Accepted */}
                  {job.status === 'accepted' && (
                    <Button
                      variant="teal"
                      size="sm"
                      icon={Navigation}
                      onClick={() => handleStartJourney(job)}
                      isLoading={actionLoading}
                    >
                      Start Journey (Live GPS)
                    </Button>
                  )}

                  {/* Status: On The Way */}
                  {job.status === 'on_the_way' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleMarkArrived(job._id)}
                      isLoading={actionLoading}
                    >
                      Mark Arrived at Site
                    </Button>
                  )}

                  {/* Status: Arrived */}
                  {job.status === 'arrived' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Wrench}
                      onClick={() => handleStartWork(job._id)}
                      isLoading={actionLoading}
                    >
                      Start Work
                    </Button>
                  )}

                  {/* Status: In Progress */}
                  {job.status === 'in_progress' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setProposedLabour(job.pricingBreakdown?.labourCharge || 300);
                          setProposedMaterial(job.pricingBreakdown?.materialCharge || 0);
                          setPriceModalOpen(true);
                        }}
                      >
                        Propose Price Adjustment
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Camera}
                        onClick={() => {
                          setSelectedJob(job);
                          setWorkProofModalOpen(true);
                        }}
                      >
                        Submit WorkProof™ & Final Bill
                      </Button>
                    </>
                  )}

                  {/* Status: Awaiting Sign-off */}
                  {job.status === 'awaiting_approval' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job);
                        setWorkProofModalOpen(true);
                      }}
                    >
                      View Submitted WorkProof
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WorkProof Modal */}
      {workProofModalOpen && selectedJob && (
        <WorkProofModal
          isOpen={workProofModalOpen}
          onClose={() => setWorkProofModalOpen(false)}
          booking={selectedJob}
          isProvider={true}
          onSuccess={fetchJobs}
        />
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Booking Request"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-500">
            Please provide a courteous reason for declining this appointment request.
          </p>
          <textarea
            rows={2}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Already scheduled on another site during this slot..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={actionLoading}>
              Decline Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Price Revision Request Modal */}
      <Modal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        title="Propose On-Site Price Revision"
      >
        <form onSubmit={handleRequestPriceChange} className="space-y-4">
          <p className="text-xs text-slate-500">
            If unforeseen repairs or expensive replacement parts are needed, submit a revised quote. The customer must review and approve before additional charges apply.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Labour Charges (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={proposedLabour}
                onChange={(e) => setProposedLabour(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parts & Materials (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={proposedMaterial}
                onChange={(e) => setProposedMaterial(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Revision *</label>
            <textarea
              rows={2}
              required
              value={proposedReason}
              onChange={(e) => setProposedReason(e.target.value)}
              placeholder="e.g. Internal copper coil burned, replacement coil needed..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPriceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Submit to Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderJobs;
