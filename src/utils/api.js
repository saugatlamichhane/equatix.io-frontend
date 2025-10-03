// src/utils/api.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: 'http://localhost:5555', // Local backend URL
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh if expired
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No user logged in for API call');
      // Optionally, throw an error or redirect to login
      throw new Error('User not authenticated');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      getAuth().signOut();
      window.location.href = '/login'; // Adjust to your login route
    }
    return Promise.reject(error);
  }
);

export default api;