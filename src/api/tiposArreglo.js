import api from './axios';

export const getTiposArreglo = async () => {
  const { data } = await api.get('/tipos-arreglo');
  return data;
};

export const createTipoArreglo = async (tipoData) => {
  const { data } = await api.post('/tipos-arreglo', tipoData);
  return data;
};

export const updateTipoArreglo = async (id, tipoData) => {
  const { data } = await api.put(`/tipos-arreglo/${id}`, tipoData);
  return data;
};

export const deleteTipoArreglo = async (id) => {
  const { data } = await api.delete(`/tipos-arreglo/${id}`);
  return data;
};

