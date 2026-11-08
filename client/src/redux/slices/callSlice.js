import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  incomingCall: null, // { caller: { id, name, role }, callId, callType, offer }
  activeCall: null,   // { targetUser, callId, callType, status: 'calling'|'connected' }
  isMuted: false,
  isVideoOff: false,
  callDuration: 0,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
      state.incomingCall = null;
      state.callDuration = 0;
    },
    setCallConnected: (state) => {
      if (state.activeCall) {
        state.activeCall.status = 'connected';
      }
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleVideo: (state) => {
      state.isVideoOff = !state.isVideoOff;
    },
    incrementCallDuration: (state) => {
      state.callDuration += 1;
    },
    resetCall: (state) => {
      state.incomingCall = null;
      state.activeCall = null;
      state.isMuted = false;
      state.isVideoOff = false;
      state.callDuration = 0;
    },
  },
});

export const {
  setIncomingCall,
  clearIncomingCall,
  setActiveCall,
  setCallConnected,
  toggleMute,
  toggleVideo,
  incrementCallDuration,
  resetCall,
} = callSlice.actions;

export default callSlice.reducer;
