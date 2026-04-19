// frontend/src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    // Use env variable in production, fallback to localhost for dev
    baseURL: 'https://thefolio-lw3l.onrender.com//api',
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}); export default
    instance;
