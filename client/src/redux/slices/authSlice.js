import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('localtrust_token') || null;
const user = localStorage.getItem('localtrust_user')
  ? JSON.parse(localStorage.getItem('localtrust_user'))
  : null;
const providerProfile = localStorage.getItem('localtrust_provider_profile')
  ? JSON.parse(localStorage.getItem('localtrust_provider_profile'))
  : null;

const initialState = {
  user,
  providerProfile,
  token,
  isAuthenticated: Boolean(token && user),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.providerProfile = action.payload.providerProfile || null;
      state.token = action.payload.accessToken;

      localStorage.setItem('localtrust_token', action.payload.accessToken);
      localStorage.setItem('localtrust_user', JSON.stringify(action.payload.user));
      if (action.payload.providerProfile) {
        localStorage.setItem('localtrust_provider_profile', JSON.stringify(action.payload.providerProfile));
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('localtrust_user', JSON.stringify(state.user));
    },
    updateProviderProfileData: (state, action) => {
      state.providerProfile = { ...state.providerProfile, ...action.payload };
      localStorage.setItem('localtrust_provider_profile', JSON.stringify(state.providerProfile));
    },
    logout: (state) => {
      state.user = null;
      state.providerProfile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('localtrust_token');
      localStorage.removeItem('localtrust_user');
      localStorage.removeItem('localtrust_provider_profile');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  updateUserData,
  updateProviderProfileData,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
