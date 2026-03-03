import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://clamx-repo-backed.vercel.app/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased to 60s for Render cold starts
  headers: { 'Content-Type': 'application/json' },
});


// Request: attach JWT
axiosInstance.interceptors.request.use(async config => {
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log('API Request:', config.method?.toUpperCase(), fullUrl);
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
    console.log('API Error:', err.message);
    if (err.config) {
      console.log('Failed URL:', `${err.config.baseURL}${err.config.url}`);
    }
    
    if (err.response) {
      console.log('Error Data:', err.response.data);
      console.log('Error Status:', err.response.status);
    } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      console.log('Request timed out. The server might be waking up (Render cold start). Please try again in a few seconds.');
    } else if (err.request) {
      console.log('No response received. Network error or potential server issue.');
    }
    
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('calmx_token');
    }
    return Promise.reject(err);
  }
);


