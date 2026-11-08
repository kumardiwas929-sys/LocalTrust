import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import {
  toggleMute,
  toggleVideo,
  incrementCallDuration,
  resetCall,
  setCallConnected,
} from '../../redux/slices/callSlice.js';
import {
  getLocalStream,
  getRemoteStream,
  cleanupWebRTC,
  startLocalMedia,
  getPeerConnection,
} from '../../services/webrtc.js';
import { getSocket } from '../../services/socket.js';
import api from '../../services/api.js';

const CallModal = () => {
  const dispatch = useDispatch();
  const { incomingCall, activeCall, isMuted, isVideoOff, callDuration } = useSelector(
    (state) => state.call
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  // Call duration counter when active and connected
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      timerRef.current = setInterval(() => {
        dispatch(incrementCallDuration());
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall, dispatch]);

  // Attach media streams to video elements
  useEffect(() => {
    const localStream = getLocalStream();
    const remoteStream = getRemoteStream();

    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [activeCall, isVideoOff]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptIncoming = async () => {
    if (!incomingCall) return;
    try {
      const pc = await getPeerConnection();
      const stream = await startLocalMedia(incomingCall.callType);

      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      socket.emit('call:answer', {
        callerId: incomingCall.caller.id,
        callId: incomingCall.callId,
        answer,
      });

      await api.patch(`/calls/${incomingCall.callId}/accept`).catch(() => {});

      dispatch(setCallConnected());
    } catch (err) {
      console.error('Error answering call:', err);
    }
  };

  const handleRejectIncoming = async () => {
    if (!incomingCall) return;
    const socket = getSocket();
    socket.emit('call:reject', {
      callerId: incomingCall.caller.id,
      callId: incomingCall.callId,
    });
    await api.patch(`/calls/${incomingCall.callId}/reject`).catch(() => {});
    cleanupWebRTC();
    dispatch(resetCall());
  };

  const handleEndCall = async () => {
    const socket = getSocket();
    if (activeCall) {
      socket.emit('call:end', {
        targetUserId: activeCall.targetUser?.id,
        callId: activeCall.callId,
      });
      await api.patch(`/calls/${activeCall.callId}/end`).catch(() => {});
    }
    cleanupWebRTC();
    dispatch(resetCall());
  };

  // If incoming call screen
  if (incomingCall) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-brand-50 border-4 border-brand-500/20 flex items-center justify-center animate-pulse">
              <Phone className="w-10 h-10 text-brand-600 animate-bounce" />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">{incomingCall.caller?.name}</h3>
          <p className="text-sm font-medium text-brand-600 mb-2 capitalize">{incomingCall.caller?.role}</p>
          <p className="text-xs text-slate-400 mb-8">
            Incoming LocalTrust Secure {incomingCall.callType === 'video' ? 'Video' : 'Audio'} Call
          </p>

          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={handleRejectIncoming}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Decline</span>
            </button>

            <button
              onClick={handleAcceptIncoming}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                {incomingCall.callType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </div>
              <span className="text-xs font-semibold text-slate-600">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If active call in progress
  if (activeCall) {
    const isVideo = activeCall.callType === 'video';

    return (
      <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl bg-navy-900 text-white shadow-2xl border border-navy-700 overflow-hidden flex flex-col">
        {/* Call header */}
        <div className="flex items-center justify-between p-4 bg-navy-800/80 border-b border-navy-700">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
            <div>
              <p className="text-sm font-semibold truncate max-w-[180px]">
                {activeCall.targetUser?.name || 'LocalTrust Verified Call'}
              </p>
              <p className="text-xs text-slate-400">
                {activeCall.status === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
              </p>
            </div>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400">
            {activeCall.callType}
          </span>
        </div>

        {/* Video / Avatar display area */}
        <div className="relative h-56 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-2 right-2 w-24 h-24 object-cover rounded-lg border-2 border-white/40 shadow-lg"
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-brand-600/30 border-2 border-brand-500 text-brand-400 flex items-center justify-center">
                <Volume2 className="w-10 h-10 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">Encrypted in-app audio stream</p>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-around p-4 bg-navy-900">
          <button
            onClick={() => dispatch(toggleMute())}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-navy-800 text-slate-200 hover:bg-navy-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {isVideo && (
            <button
              onClick={() => dispatch(toggleVideo())}
              className={`p-3 rounded-full transition-colors ${
                isVideoOff ? 'bg-rose-500 text-white' : 'bg-navy-800 text-slate-200 hover:bg-navy-700'
              }`}
              title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CallModal;
