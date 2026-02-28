import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});


// Request: attach JWT
axiosInstance.interceptors.request.use(async config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  const token = await SecureStore.getItemAsync('calmx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: handle 401
axiosInstance.interceptors.response.use(
  r => {
    console.log('API Response:', r.status, r.config.url);
    return r;
  },
  async err => {
    console.log('API Error:', err.message, err.config?.url);
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('calmx_token');
    }
    return Promise.reject(err);
  }
);


