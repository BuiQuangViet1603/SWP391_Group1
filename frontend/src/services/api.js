import axios from 'axios';

/**
 * ============================================================================
 * Centralized API Client Service
 * ============================================================================
 * Provides an Axios instance configured with defaults and interceptors for
 * communicating with the Spring Boot backend (/api).
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Attach JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Friendly error message handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Response Warning/Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
