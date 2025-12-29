import api from './axios';

export const getPedidos = async (params = {}) => {
  const { data } = await api.get('/pedidos', { params });
  return data;
};

export const getPedidoById = async (id) => {
  const { data } = await api.get(`/pedidos/${id}`);
  return data;
};

export const createPedido = async (formData) => {
  const { data } = await api.post('/pedidos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updatePedido = async (id, pedidoData) => {
  // Si hay archivos, usar FormData
  if (pedidoData instanceof FormData) {
    const { data } = await api.put(`/pedidos/${id}`, pedidoData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  // Si no, enviar JSON normal
  const { data } = await api.put(`/pedidos/${id}`, pedidoData);
  return data;
};

export const getPedidosPendientes = async () => {
  const { data } = await api.get('/pedidos/pendientes');
  return data;
};

