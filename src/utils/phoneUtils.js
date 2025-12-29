/**
 * Utilidades para manejo de números de teléfono
 */

/**
 * Formatea un número de teléfono para mostrar
 * @param {string} telefono - Número de teléfono con o sin prefijo
 * @returns {string} - Número formateado con prefijo
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  // Si ya tiene prefijo, retornarlo tal cual
  if (telefono.startsWith('+')) {
    return telefono;
  }
  
  // Si no tiene prefijo, agregar +57 por defecto (Colombia)
  const numeroLimpio = telefono.replace(/[^0-9]/g, '');
  if (numeroLimpio.length > 0) {
    return '+57 ' + numeroLimpio;
  }
  
  return telefono;
};

/**
 * Valida que un número de teléfono tenga prefijo
 * @param {string} telefono - Número de teléfono
 * @returns {boolean} - true si tiene prefijo válido
 */
export const tienePrefijo = (telefono) => {
  if (!telefono) return false;
  return /^\+\d{1,3}\s?\d{7,12}$/.test(telefono.replace(/\s/g, ''));
};

/**
 * Normaliza un número de teléfono para almacenamiento
 * @param {string} telefono - Número de teléfono
 * @returns {string} - Número normalizado con prefijo
 */
export const normalizarTelefono = (telefono) => {
  if (!telefono) return '';
  
  // Limpiar espacios y caracteres especiales excepto +
  let numeroLimpio = telefono.replace(/[^\d+]/g, '');
  
  // Si ya tiene prefijo, eliminar el 0 inicial del número si existe
  if (numeroLimpio.startsWith('+')) {
    // Separar código de país y número
    const match = numeroLimpio.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      const codigoPais = match[1];
      let numero = match[2];
      // Eliminar el 0 inicial del número si existe
      if (numero.startsWith('0')) {
        numero = numero.substring(1);
      }
      return codigoPais + numero;
    }
    return numeroLimpio;
  }
  
  // Si no tiene prefijo, eliminar el 0 inicial y agregar +57 por defecto
  if (numeroLimpio.startsWith('0')) {
    numeroLimpio = numeroLimpio.substring(1);
  }
  return '+57' + numeroLimpio;
};

/**
 * Extrae el código de país de un número
 * @param {string} telefono - Número de teléfono
 * @returns {string} - Código de país (ej: +57)
 */
export const extraerCodigoPais = (telefono) => {
  if (!telefono) return '+57';
  
  const match = telefono.match(/^(\+\d{1,3})/);
  return match ? match[1] : '+57';
};

/**
 * Extrae el número sin código de país
 * @param {string} telefono - Número de teléfono
 * @returns {string} - Número sin prefijo
 */
export const extraerNumero = (telefono) => {
  if (!telefono) return '';
  
  const match = telefono.match(/^\+\d{1,3}\s?(.*)$/);
  let numero = match ? match[1].replace(/\s/g, '') : telefono.replace(/[^0-9]/g, '');
  // Eliminar el 0 inicial si existe
  if (numero.startsWith('0')) {
    numero = numero.substring(1);
  }
  return numero;
};

