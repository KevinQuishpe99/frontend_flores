import api from './axios';

export const createUsuario = async (usuarioData) => {
  const { data } = await api.post('/admin/usuarios', usuarioData);
  return data;
};

export const getUsuarios = async (params = {}) => {
  const { data } = await api.get('/admin/usuarios', { params });
  return data;
};

export const getUsuarioById = async (id) => {
  const { data } = await api.get(`/admin/usuarios/${id}`);
  return data;
};

export const updateUsuario = async (id, usuarioData) => {
  const { data } = await api.put(`/admin/usuarios/${id}`, usuarioData);
  return data;
};

export const deleteUsuario = async (id) => {
  const { data } = await api.delete(`/admin/usuarios/${id}`);
  return data;
};

export const getEstadisticas = async () => {
  const { data } = await api.get('/admin/estadisticas');
  return data;
};

export const getEmpleados = async () => {
  const { data } = await api.get('/admin/usuarios', { params: { rol: 'EMPLEADO' } });
  return data;
};

export const getGerentes = async () => {
  const { data } = await api.get('/admin/usuarios', { params: { rol: 'GERENTE' } });
  return data;
};

export const actualizarPreciosMasivo = async (porcentaje, soloDisponibles = false) => {
  const { data } = await api.post('/admin/arreglos/actualizar-precios', {
    porcentaje,
    soloDisponibles,
  });
  return data;
};

