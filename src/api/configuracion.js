import axios from './axios';

export const getConfiguraciones = () => {
  return axios.get('/configuracion/all');
};

export const getConfiguracion = (clave) => {
  return axios.get(`/configuracion/${clave}`);
};

export const updateTema = (data) => {
  const formData = new FormData();
  
  if (data.logoFile) {
    formData.append('logo', data.logoFile);
  }
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  if (data.colorPrimario) {
    formData.append('colorPrimario', data.colorPrimario);
  }
  if (data.colorSecundario) {
    formData.append('colorSecundario', data.colorSecundario);
  }
  if (data.colorAcento) {
    formData.append('colorAcento', data.colorAcento);
  }
  if (data.colorTexto) {
    formData.append('colorTexto', data.colorTexto);
  }
  if (data.tituloInicio) {
    formData.append('tituloInicio', data.tituloInicio);
  }
  if (data.mensajeInicio) {
    formData.append('mensajeInicio', data.mensajeInicio);
  }
  if (data.direccionEmpresa !== undefined) {
    formData.append('direccionEmpresa', data.direccionEmpresa);
  }
  if (data.whatsappEmpresa1 !== undefined) {
    formData.append('whatsappEmpresa1', data.whatsappEmpresa1);
  }
  if (data.whatsappEmpresa2 !== undefined) {
    formData.append('whatsappEmpresa2', data.whatsappEmpresa2);
  }

  return axios.put('/configuracion/tema', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const setConfiguracion = (clave, valor, tipo = 'text', descripcion = null, archivo = null) => {
  const formData = new FormData();
  formData.append('clave', clave);
  formData.append('valor', valor);
  formData.append('tipo', tipo);
  if (descripcion) {
    formData.append('descripcion', descripcion);
  }
  if (archivo) {
    formData.append('archivo', archivo);
  }

  return axios.post('/configuracion', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

