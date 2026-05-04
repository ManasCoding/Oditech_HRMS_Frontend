import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://oditech-hrms-backend-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
