import api from './axios';

export const getNotificaciones = async () => {
  const { data } = await api.get('/notificaciones');
  return data;
};

export const getNotificacionesNoLeidas = async () => {
  const { data } = await api.get('/notificaciones/no-leidas');
  return data;
};

export const marcarLeida = async (id) => {
  const { data } = await api.put(`/notificaciones/${id}/leida`);
  return data;
};

export const marcarTodasLeidas = async () => {
  const { data } = await api.put('/notificaciones/todas/leidas');
  return data;
};

