import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import LiveMap from '../../components/tracking/LiveMap.jsx';
import Button from '../../components/common/Button.jsx';
import { setActiveCall } from '../../redux/slices/callSlice.js';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { getSocket } from '../../services/socket.js';
import { startLocalMedia, getPeerConnection } from '../../services/webrtc.js';

const TrackingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/tracking/${bookingId}`)
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      .catch((err) => setError(err.message || 'Could not fetch live tracking data'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleCallProvider = async () => {
    if (!data?.booking?.provider?.userId) return;
    try {
      const receiverId = data.booking.provider.userId._id || data.booking.provider.userId;
      const res = await api.post('/calls/initiate', {
        receiverId,
        bookingId,
        callType: 'audio',
      });

      if (res?.data) {
        const stream = await startLocalMedia('audio');
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
          callType: 'audio',
        });

        dispatch(
          setActiveCall({
            targetUser: {
              id: receiverId,
              name: data.booking.provider.businessName,
              role: 'provider',
            },
            callId: res.data.callId,
            callType: 'audio',
            status: 'calling',
          })
        );
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Call failed' }));
    }
  };

  const handleChatProvider = async () => {
    try {
      const recipientId = data.booking.provider.userId._id || data.booking.provider.userId;
      const res = await api.post('/chat/conversations', {
        recipientId,
        bookingId,
      });
      if (res?.data) {
        navigate(`/customer/messages?conversation=${res.data._id}`);
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Chat unavailable' }));
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading GPS stream...</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-slate-700 font-bold">{error || 'Tracking data unavailable'}</p>
        <Link to="/customer/bookings">
          <Button variant="outline" size="sm">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/customer/bookings/${bookingId}`}>
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Booking
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-navy-900">
          Live Doorstep Arrival Tracker (#{data.booking.bookingNumber})
        </h1>
      </div>

      <LiveMap
        bookingId={bookingId}
        initialData={data}
        onCallProvider={handleCallProvider}
        onChatProvider={handleChatProvider}
      />
    </div>
  );
};

export default TrackingPage;
