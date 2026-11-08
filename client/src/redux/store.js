import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import callReducer from './slices/callSlice.js';
import notificationReducer from './slices/notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    call: callReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows media streams in WebRTC actions if needed
    }),
});

export default store;
