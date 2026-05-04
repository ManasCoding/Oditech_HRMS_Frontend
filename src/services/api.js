import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (loginId, password, isAdmin) => {
  try {
    const response = await api.post('/login', { loginId, password, isAdmin });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
