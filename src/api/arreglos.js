import api from './axios';

export const getArreglos = async (params = {}) => {
  const { data } = await api.get('/arreglos', { params });
  return data;
};

export const getArregloById = async (id) => {
  const { data } = await api.get(`/arreglos/${id}`);
  return data;
};

export const createArreglo = async (formData) => {
  const { data } = await api.post('/arreglos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateArreglo = async (id, formData) => {
  const { data } = await api.put(`/arreglos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteArreglo = async (id) => {
  const { data } = await api.delete(`/arreglos/${id}`);
  return data;
};

