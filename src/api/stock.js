import api from './axios';

export const getStock = async (params = {}) => {
  const { data } = await api.get('/stock', { params });
  return data;
};

export const getStockStats = async () => {
  const { data } = await api.get('/stock/stats');
  return data;
};

export const createStock = async (stockData) => {
  // Si stockData es FormData, enviarlo directamente
  if (stockData instanceof FormData) {
    const { data } = await api.post('/stock', stockData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  // Si es objeto normal, enviarlo como JSON
  const { data } = await api.post('/stock', stockData);
  return data;
};

export const venderStock = async (id, ventaData) => {
  const formData = new FormData();
  formData.append('metodoPago', ventaData.metodoPago);
  if (ventaData.notas) {
    formData.append('notas', ventaData.notas);
  }
  if (ventaData.comprobantePago) {
    formData.append('comprobantePago', ventaData.comprobantePago);
  }

  const { data } = await api.post(`/stock/${id}/vender`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateStock = async (id, stockData) => {
  const { data } = await api.put(`/stock/${id}`, stockData);
  return data;
};

export const deleteStock = async (id) => {
  const { data } = await api.delete(`/stock/${id}`);
  return data;
};

