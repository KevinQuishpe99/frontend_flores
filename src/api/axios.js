import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Función para obtener la URL del backend
const getBackendURL = () => {
  // En producción, usar VITE_API_URL si está configurado
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Si no termina en /api, agregarlo
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }
  
  // En desarrollo, intentar obtener la IP desde window.location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si no es localhost, usar la IP actual (funciona desde celular)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  
  // Por defecto en desarrollo, usar localhost
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBackendURL(),
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

