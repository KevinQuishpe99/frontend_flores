import api from './axios';

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const googleLogin = async (token) => {
  const { data } = await api.post('/auth/google', { token });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const updateProfile = async (profileData) => {
  // Si es FormData, no establecer Content-Type (dejar que el navegador lo haga)
  const config = profileData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  
  const { data } = await api.put('/auth/profile', profileData, config);
  return data;
};

