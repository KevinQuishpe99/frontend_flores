import { getConfiguraciones } from '../api/configuracion';

// Colores por defecto
const COLORES_DEFAULT = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#8b5cf6',
};

// Función para aplicar colores del tema a CSS
export const aplicarTema = (configuraciones = {}) => {
  const colorPrimario = configuraciones.color_primario || COLORES_DEFAULT.primary;
  const colorSecundario = configuraciones.color_secundario || COLORES_DEFAULT.secondary;
  const colorAcento = configuraciones.color_acento || COLORES_DEFAULT.accent;

  // Crear o actualizar variables CSS
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colorPrimario);
  root.style.setProperty('--color-secondary', colorSecundario);
  root.style.setProperty('--color-accent', colorAcento);

  // También actualizar Tailwind si es posible (requiere recargar)
  // Por ahora, usaremos clases inline o estilos en componentes específicos
};

// Función para cargar y aplicar tema
export const cargarTema = async () => {
  try {
    const response = await getConfiguraciones();
    const configuraciones = response.data || {};
    aplicarTema(configuraciones);
    return configuraciones;
  } catch (error) {
    console.error('Error al cargar tema:', error);
    aplicarTema({});
    return {};
  }
};

// Función para obtener el logo
export const obtenerLogo = (configuraciones = {}) => {
  return configuraciones.logo || null;
};

