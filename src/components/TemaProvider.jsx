import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConfiguraciones } from '../api/configuracion';
import { aplicarTema } from '../utils/tema';

export default function TemaProvider({ children }) {
  const [configuraciones, setConfiguraciones] = useState({});

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
    } else if (error) {
      // Si hay error, usar valores por defecto (objeto vacío)
      setConfiguraciones({});
    }
  }, [data, error]);

  // Aplicar colores como CSS variables
  useEffect(() => {
    if (Object.keys(configuraciones).length > 0) {
      const root = document.documentElement;
      
      if (configuraciones.color_primario) {
        root.style.setProperty('--color-primary', configuraciones.color_primario);
      }
      if (configuraciones.color_secundario) {
        root.style.setProperty('--color-secondary', configuraciones.color_secundario);
      }
      if (configuraciones.color_acento) {
        root.style.setProperty('--color-accent', configuraciones.color_acento);
      }
    }
  }, [configuraciones]);

  return <>{children}</>;
}

