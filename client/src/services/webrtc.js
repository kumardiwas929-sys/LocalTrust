import { getSocket } from './socket.js';
import api from './api.js';

let peerConnection = null;
let localStream = null;
let remoteStream = null;

const defaultIceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const getPeerConnection = async () => {
  if (peerConnection) return peerConnection;

  let iceServers = defaultIceServers;
  try {
    const res = await api.get('/calls/ice-servers');
    if (res?.data?.iceServers) {
      iceServers = res.data.iceServers;
    }
  } catch (err) {
    console.warn('[WebRTC] Using fallback STUN servers:', err.message);
  }

  peerConnection = new RTCPeerConnection({ iceServers });

  // Handle incoming remote track
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const socket = getSocket();
      socket.emit('call:ice-candidate', {
        candidate: event.candidate,
      });
    }
  };

  return peerConnection;
};

export const startLocalMedia = async (callType = 'audio') => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    return localStream;
  } catch (err) {
    console.warn('[WebRTC] Media device access not allowed or unavailable:', err.message);
    // Return dummy silent/empty stream so call UI remains testable
    return null;
  }
};

export const getLocalStream = () => localStream;
export const getRemoteStream = () => remoteStream;

export const cleanupWebRTC = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
    remoteStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
};
