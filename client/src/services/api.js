import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if access token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('localtrust_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data?.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('localtrust_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh token failed, clear storage
        localStorage.removeItem('localtrust_token');
        localStorage.removeItem('localtrust_user');
        localStorage.removeItem('localtrust_provider_profile');
      }
    }

    return Promise.reject(
      error.response?.data || { success: false, message: error.message || 'Network error' }
    );
  }
);

export default api;
