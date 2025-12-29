import api from './axios';

export const getFlores = async (params = {}) => {
  const { data } = await api.get('/flores', { params });
  return data;
};

export const getFlorById = async (id) => {
  const { data } = await api.get(`/flores/${id}`);
  return data;
};

export const createFlor = async (formData) => {
  const { data } = await api.post('/flores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateFlor = async (id, formData) => {
  const { data } = await api.put(`/flores/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteFlor = async (id) => {
  const { data } = await api.delete(`/flores/${id}`);
  return data;
};

