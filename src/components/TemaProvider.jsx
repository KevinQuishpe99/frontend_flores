import { useEffect, useState, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConfiguraciones } from '../api/configuracion';
import { aplicarTema } from '../utils/tema';

const TemaContext = createContext();

export const useTema = () => useContext(TemaContext);

export default function TemaProvider({ children }) {
  const [configuraciones, setConfiguraciones] = useState({});
  const [logoUrl, setLogoUrl] = useState(null);

  const { data, error } = useQuery({
    queryKey: ['configuraciones-public'],
    queryFn: () => getConfiguraciones(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1, // Solo reintentar una vez
    onError: (err) => {
      console.warn('Error al cargar configuraciones (usando valores por defecto):', err);
    }
  });

  useEffect(() => {
    if (data?.data) {
      setConfiguraciones(data.data);
      aplicarTema(data.data);
      setLogoUrl(data.data.logo || null);
    } else if (error) {
      // Si hay error, usar valores por defecto (objeto vacío)
      setConfiguraciones({});
      setLogoUrl(null);
    }
  }, [data, error]);

  // Aplicar colores como CSS variables y actualizar Tailwind
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar colores del tema
    const colorPrimario = configuraciones.color_primario || '#10b981';
    const colorSecundario = configuraciones.color_secundario || '#3b82f6';
    const colorAcento = configuraciones.color_acento || '#8b5cf6';
    const colorTexto = configuraciones.color_texto || '#1f2937';
    
    root.style.setProperty('--color-primary', colorPrimario);
    root.style.setProperty('--color-secondary', colorSecundario);
    root.style.setProperty('--color-accent', colorAcento);
    root.style.setProperty('--color-text', colorTexto);
    
    // Actualizar clases de Tailwind dinámicamente
    // Esto permite que los colores se actualicen sin recargar
    const style = document.createElement('style');
    style.id = 'tema-dinamico';
    
    // Función para convertir hex a rgba
    const hexToRgba = (hex, alpha = 1) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    style.textContent = `
      :root {
        --color-primary: ${colorPrimario} !important;
        --color-secondary: ${colorSecundario} !important;
        --color-accent: ${colorAcento} !important;
        --color-text: ${colorTexto} !important;
      }
      /* Colores primarios */
      .text-primary-600, .text-primary-700, .text-primary-500 { color: ${colorPrimario} !important; }
      .bg-primary-50 { background-color: ${hexToRgba(colorPrimario, 0.1)} !important; }
      .bg-primary-100 { background-color: ${hexToRgba(colorPrimario, 0.2)} !important; }
      .bg-primary-500, .bg-primary-600, .bg-primary-700 { background-color: ${colorPrimario} !important; }
      .border-primary-200, .border-primary-300, .border-primary-500, .border-primary-600, .border-primary-700 { border-color: ${colorPrimario} !important; }
      .btn-primary { background-color: ${colorPrimario} !important; border-color: ${colorPrimario} !important; }
      .btn-primary:hover { background-color: ${colorPrimario}dd !important; }
      
      /* Colores secundarios */
      .text-secondary-600, .text-secondary-700 { color: ${colorSecundario} !important; }
      .bg-secondary-50 { background-color: ${hexToRgba(colorSecundario, 0.1)} !important; }
      .bg-secondary-600 { background-color: ${colorSecundario} !important; }
      
      /* Colores de acento */
      .text-accent-600 { color: ${colorAcento} !important; }
      .bg-accent-50 { background-color: ${hexToRgba(colorAcento, 0.1)} !important; }
      .bg-accent-600 { background-color: ${colorAcento} !important; }
      
      /* Color de texto global */
      body, .text-gray-900 { color: ${colorTexto} !important; }
      .card, .bg-white, h1, h2, h3, h4, h5, h6, p { color: ${colorTexto} !important; }
      
      /* Aplicar en cards y componentes */
      .card, .bg-white { color: ${colorTexto} !important; }
      
      /* Links y botones con color primario */
      a.text-primary-600, a.text-primary-700 { color: ${colorPrimario} !important; }
    `;
    
    // Remover estilo anterior si existe
    const existingStyle = document.getElementById('tema-dinamico');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }, [configuraciones]);

  return (
    <TemaContext.Provider value={{ 
      logo: logoUrl, 
      configuraciones,
      colorPrimario: configuraciones.color_primario || '#10b981',
      colorSecundario: configuraciones.color_secundario || '#3b82f6',
      colorAcento: configuraciones.color_acento || '#8b5cf6',
      colorTexto: configuraciones.color_texto || '#1f2937',
      tituloInicio: configuraciones.titulo_inicio || '🌸 Arreglos Florales Excepcionales',
      mensajeInicio: configuraciones.mensaje_inicio || 'Descubre nuestra colección única de arreglos florales artesanales',
    }}>
      {children}
    </TemaContext.Provider>
  );
}

