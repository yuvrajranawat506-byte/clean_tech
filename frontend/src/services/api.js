// frontend/src/services/api.js
// Centralized Axios instance — all API calls go through here
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecotrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — clear token and redirect
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ─── Pickups ────────────────────────────────────
export const pickupsAPI = {
  create: (data) => api.post('/pickups', data),
  getMyPickups: (params) => api.get('/pickups/my', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  cancel: (id) => api.patch(`/pickups/${id}/cancel`),
};

// ─── Dashboard ──────────────────────────────────
export const dashboardAPI = {
  getUserDashboard: () => api.get('/dashboard/user'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
};

// ─── Rewards ────────────────────────────────────
export const rewardsAPI = {
  getMyRewards: () => api.get('/rewards/my'),
};

// ─── Admin ──────────────────────────────────────
export const adminAPI = {
  getAllPickups: (params) => api.get('/admin/pickups', { params }),
  updatePickupStatus: (id, status) => api.patch(`/admin/pickups/${id}/status`, { status }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
};

// ─── Users ──────────────────────────────────────
export const usersAPI = {
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.patch('/users/password', data),
};

export default api;
