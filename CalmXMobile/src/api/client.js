import axios from 'axios';
import useStore from '../store/useStore';

const client = axios.create({
    baseURL: 'http://localhost:5000/api', // Use your machine's IP for real device testing
});

client.interceptors.request.use((config) => {
    const token = useStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
