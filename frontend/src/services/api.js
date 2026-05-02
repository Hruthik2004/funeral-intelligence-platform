import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const providerAPI = {
  scrape: (url) => api.post('/scrape', { url }),
  getAll: (limit = 100, offset = 0) => api.get('/providers', { params: { limit, offset } }),
  search: (q, limit = 50) => api.get('/search', { params: { q, limit } }),
  getById: (id) => api.get(`/providers/${id}`),
};

export const chatAPI = {
  sendMessage: (message, history = []) =>
    api.post('/chat', { message, history }),
};

export default api;
