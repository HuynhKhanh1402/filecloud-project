import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: any) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      Cookies.set('token', response.data.access_token, { expires: 7 }); // Expires in 7 days
    }
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async verifyToken() {
    try {
      const token = Cookies.get('token');
      if (!token) return false;
      await api.get('/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  },

  logout() {
    Cookies.remove('token');
  },
};

export default api;
