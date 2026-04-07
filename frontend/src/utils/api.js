import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials)
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (payload) => api.put('/user/profile', payload),
  changePassword: (payload) => api.post('/user/change-password', payload),
  deleteAccount: (payload) => api.delete('/user', { data: payload })
};

// Itinerary APIs
export const itineraryAPI = {
  generate: (data) => api.post('/itinerary/generate', data),
  save: (data) => api.post('/itinerary/save', data),
  getUserItineraries: () => api.get('/itinerary/user'),
  getById: (id) => api.get(`/itinerary/${id}`),
  delete: (id) => api.delete(`/itinerary/${id}`)
};

// Contact APIs
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact')
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getGlobalUsage: () => api.get('/admin/usage/global'),
  getUserUsage: () => api.get('/admin/usage/users')
};

export default api;
