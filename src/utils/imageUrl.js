/**
 * Convierte una URL de imagen a URL absoluta optimizada
 * Si es una URL de Cloudinary (https://), la optimiza automáticamente
 * Si es una ruta relativa (/uploads/...), la convierte a URL absoluta del backend
 * Si es un data URL (base64), la devuelve tal cual
 */
export const getImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return null;
  
  // Si es un data URL (base64), devolverlo tal cual
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si es una URL de Cloudinary, agregar transformaciones de optimización para display
  if (imageUrl.startsWith('https://res.cloudinary.com/')) {
    const width = options.width || 800; // Tamaño optimizado para catálogo
    const height = options.height || 800;
    
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/v{version}/{public_id}.{format}
    // Insertar transformaciones antes de /v{version} o al inicio si no hay versión
    
    // Buscar la posición donde insertar transformaciones
    const uploadIndex = imageUrl.indexOf('/image/upload/');
    if (uploadIndex > 0) {
      const baseUrl = imageUrl.substring(0, uploadIndex + '/image/upload/'.length);
      const restOfPath = imageUrl.substring(uploadIndex + '/image/upload/'.length);
      
      // Verificar si ya tiene transformaciones (no empieza con 'v')
      if (restOfPath.startsWith('v')) {
        // No tiene transformaciones, insertar antes de la versión
        const optimizations = `w_${width},h_${height},c_limit,q_auto:good,f_auto`;
        return `${baseUrl}${optimizations}/${restOfPath}`;
      } else if (restOfPath.includes('/v')) {
        // Ya tiene transformaciones, agregar las nuestras
        const parts = restOfPath.split('/v');
        const optimizations = `w_${width},h_${height},c_limit,q_auto:good,f_auto`;
        return `${baseUrl}${parts[0]}/${optimizations}/v${parts[1]}`;
      } else {
        // No tiene versión, agregar transformaciones
        const optimizations = `w_${width},h_${height},c_limit,q_auto:good,f_auto`;
        return `${baseUrl}${optimizations}/${restOfPath}`;
      }
    }
    
    // Si no se puede parsear, devolver original (Cloudinary ya optimiza en upload)
    return imageUrl;
  }
  
  // Si ya es una URL absoluta (http://), devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es una ruta relativa, convertirla a URL absoluta del backend
  let apiUrl = import.meta.env.VITE_API_URL;
  
  // Si no hay variable de entorno, intentar obtener la IP del navegador
  if (!apiUrl && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      apiUrl = `http://${hostname}:5000/api`;
    } else {
      // Usar IP por defecto de red local
      const backendIP = import.meta.env.VITE_BACKEND_IP || '192.168.100.146';
      apiUrl = `http://${backendIP}:5000/api`;
    }
  }
  
  if (!apiUrl) {
    const backendIP = import.meta.env.VITE_BACKEND_IP || '192.168.100.146';
    apiUrl = `http://${backendIP}:5000/api`;
  }
  
  const baseUrl = apiUrl.replace('/api', ''); // Remover /api del final
  
  // Si la ruta ya empieza con /, solo concatenar
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // Si no empieza con /, agregarlo
  return `${baseUrl}/${imageUrl}`;
};

