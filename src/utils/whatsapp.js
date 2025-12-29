/**
 * Utilidad para contactar por WhatsApp desde cualquier dispositivo
 * Funciona en móvil (abre app) y escritorio (abre WhatsApp Web)
 */

import { normalizarTelefono } from './phoneUtils';

export const contactarWhatsApp = (telefono) => {
  if (!telefono) {
    return null;
  }
  
  // Normalizar el número (asegurar que tenga prefijo)
  const numeroNormalizado = normalizarTelefono(telefono);
  
  // Limpiar para URL: quitar espacios, mantener solo números y +
  const numeroLimpio = numeroNormalizado.replace(/[^0-9+]/g, '');
  
  // Validar que tenga prefijo
  if (!numeroLimpio.startsWith('+')) {
    console.warn('Número sin prefijo, agregando +57 por defecto:', telefono);
    const numeroSinPrefijo = numeroLimpio.replace(/[^0-9]/g, '');
    const numeroFinal = '+57' + numeroSinPrefijo;
    const url = `https://wa.me/${numeroFinal}`;
    window.open(url, '_blank');
    return url;
  }
  
  // Abrir WhatsApp Web o App según el dispositivo
  // wa.me funciona tanto en móvil (abre app) como en escritorio (abre web)
  const url = `https://wa.me/${numeroLimpio}`;
  window.open(url, '_blank');
  
  return url;
};

