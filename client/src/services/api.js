import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this to your server URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear stored token and redirect to login
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // You might want to dispatch a logout action here
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  updatePushToken: (token) => api.put('/auth/push-token', { pushToken: token }),
};

// Parking API
export const parkingAPI = {
  getAll: (params) => api.get('/parking', { params }),
  getById: (id) => api.get(`/parking/${id}`),
  create: (parkingData) => api.post('/parking', parkingData),
  update: (id, parkingData) => api.put(`/parking/${id}`, parkingData),
  delete: (id) => api.delete(`/parking/${id}`),
  search: (params) => api.get('/parking/search', { params }),
  getNearby: (params) => api.get('/parking/radius', { params }),
  updateAvailability: (id, availabilityData) => 
    api.put(`/parking/${id}/availability`, availabilityData),
  getStats: (id) => api.get(`/parking/${id}/stats`),
};

// Reviews API
export const reviewsAPI = {
  getByParkingLot: (parkingLotId) => api.get(`/parking/${parkingLotId}/reviews`),
  getById: (parkingLotId, reviewId) => 
    api.get(`/parking/${parkingLotId}/reviews/${reviewId}`),
  create: (parkingLotId, reviewData) => 
    api.post(`/parking/${parkingLotId}/reviews`, reviewData),
  update: (parkingLotId, reviewId, reviewData) => 
    api.put(`/parking/${parkingLotId}/reviews/${reviewId}`, reviewData),
  delete: (parkingLotId, reviewId) => 
    api.delete(`/parking/${parkingLotId}/reviews/${reviewId}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  create: (userData) => api.post('/user', userData),
  update: (id, userData) => api.put(`/user/${id}`, userData),
  delete: (id) => api.delete(`/user/${id}`),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export { api }; 