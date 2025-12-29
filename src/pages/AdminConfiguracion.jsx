import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfiguraciones, updateTema } from '../api/configuracion';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import { PhotoIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

export default function AdminConfiguracion() {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorPrimario, setColorPrimario] = useState('#10b981');
  const [colorSecundario, setColorSecundario] = useState('#3b82f6');
  const [colorAcento, setColorAcento] = useState('#8b5cf6');

  // Obtener configuraciones actuales
  const { data: configuraciones = {}, isLoading } = useQuery({
    queryKey: ['configuraciones'],
    queryFn: getConfiguraciones,
  });

  useEffect(() => {
    if (configuraciones.logo) {
      setLogoPreview(configuraciones.logo);
    }
    if (configuraciones.color_primario) {
      setColorPrimario(configuraciones.color_primario);
    }
    if (configuraciones.color_secundario) {
      setColorSecundario(configuraciones.color_secundario);
    }
    if (configuraciones.color_acento) {
      setColorAcento(configuraciones.color_acento);
    }
  }, [configuraciones]);

  const updateMutation = useMutation({
    mutationFn: updateTema,
    onSuccess: () => {
      queryClient.invalidateQueries(['configuraciones']);
      toast.success('Configuración actualizada correctamente');
      // Recargar la página para aplicar los nuevos colores
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar configuración');
    },
  });

  const handleLogoSelect = (file, editedImageDataUrl) => {
    setLogoFile(file);
    setLogoPreview(editedImageDataUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      logoFile,
      colorPrimario,
      colorSecundario,
      colorAcento,
    };

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Configuración de la Aplicación
        </h1>
        <p className="text-gray-600 text-sm">
          Personaliza el logo y los colores de la aplicación
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-primary-600" />
            Logo de la Aplicación
          </h2>
          
          <ImageUpload
            onImageSelect={handleLogoSelect}
            currentImage={logoPreview}
            label="Logo"
            required={false}
          />
          
          {logoPreview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <img
                src={logoPreview}
                alt="Logo preview"
                className="max-w-xs h-20 object-contain"
              />
            </div>
          )}
        </div>

        {/* Colores */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PaintBrushIcon className="w-5 h-5 text-primary-600" />
            Colores del Tema
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="flex-1 input text-sm font-mono"
                  placeholder="#10b981"
                />
              </div>
              <div className="mt-2 h-8 rounded" style={{ backgroundColor: colorPrimario }}></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Secundario
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="flex-1 input text-sm font-mono"
                  placeholder="#3b82f6"
                />
              </div>
              <div className="mt-2 h-8 rounded" style={{ backgroundColor: colorSecundario }}></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Acento
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colorAcento}
                  onChange={(e) => setColorAcento(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorAcento}
                  onChange={(e) => setColorAcento(e.target.value)}
                  className="flex-1 input text-sm font-mono"
                  placeholder="#8b5cf6"
                />
              </div>
              <div className="mt-2 h-8 rounded" style={{ backgroundColor: colorAcento }}></div>
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="card p-4 sm:p-6 bg-gray-50">
          <h3 className="text-md font-semibold mb-3">Vista Previa del Tema</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg" style={{ backgroundColor: colorPrimario }}>
              <p className="text-white font-semibold">Color Primario</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colorSecundario }}>
              <p className="text-white font-semibold">Color Secundario</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colorAcento }}>
              <p className="text-white font-semibold">Color de Acento</p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => {
              setColorPrimario('#10b981');
              setColorSecundario('#3b82f6');
              setColorAcento('#8b5cf6');
              setLogoFile(null);
              setLogoPreview(configuraciones.logo || null);
            }}
            className="btn-secondary"
          >
            Restaurar Valores por Defecto
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}

