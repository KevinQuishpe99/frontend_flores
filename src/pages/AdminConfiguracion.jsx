import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfiguraciones, updateTema } from '../api/configuracion';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import { PhotoIcon, PaintBrushIcon, DocumentTextIcon, SparklesIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function AdminConfiguracion() {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorPrimario, setColorPrimario] = useState('#10b981');
  const [colorSecundario, setColorSecundario] = useState('#3b82f6');
  const [colorAcento, setColorAcento] = useState('#8b5cf6');
  const [colorTexto, setColorTexto] = useState('#1f2937');
  const [tituloInicio, setTituloInicio] = useState('🌸 Arreglos Florales Excepcionales');
  const [mensajeInicio, setMensajeInicio] = useState('Descubre nuestra colección única de arreglos florales artesanales');
  const [direccionEmpresa, setDireccionEmpresa] = useState('');
  const [whatsappEmpresa1, setWhatsappEmpresa1] = useState('');
  const [whatsappEmpresa2, setWhatsappEmpresa2] = useState('');

  // Obtener configuraciones actuales
  const { data: configuracionesResponse, isLoading } = useQuery({
    queryKey: ['configuraciones'],
    queryFn: getConfiguraciones,
  });

  // Extraer las configuraciones del response
  // El backend devuelve { clave: { valor, tipo, descripcion } }
  const configuracionesRaw = configuracionesResponse?.data || {};
  
  // Convertir a formato simple para usar en el componente
  const configuraciones = useMemo(() => {
    const simple = {};
    Object.keys(configuracionesRaw).forEach(key => {
      simple[key] = configuracionesRaw[key]?.valor || configuracionesRaw[key];
    });
    return simple;
  }, [configuracionesResponse]);

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
    if (configuraciones.color_texto) {
      setColorTexto(configuraciones.color_texto);
    }
    if (configuraciones.titulo_inicio) {
      setTituloInicio(configuraciones.titulo_inicio);
    }
    if (configuraciones.mensaje_inicio) {
      setMensajeInicio(configuraciones.mensaje_inicio);
    }
    if (configuraciones.direccion_empresa) {
      setDireccionEmpresa(configuraciones.direccion_empresa);
    }
    if (configuraciones.whatsapp_empresa_1) {
      setWhatsappEmpresa1(configuraciones.whatsapp_empresa_1);
    }
    if (configuraciones.whatsapp_empresa_2) {
      setWhatsappEmpresa2(configuraciones.whatsapp_empresa_2);
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
      colorTexto,
      tituloInicio,
      mensajeInicio,
      direccionEmpresa,
      whatsappEmpresa1,
      whatsappEmpresa2,
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

        {/* Color de Texto */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PaintBrushIcon className="w-5 h-5 text-primary-600" />
            Color de Texto
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Texto Principal
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={colorTexto}
                onChange={(e) => setColorTexto(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorTexto}
                onChange={(e) => setColorTexto(e.target.value)}
                className="flex-1 input text-sm font-mono"
                placeholder="#1f2937"
              />
            </div>
            <div className="mt-2 p-4 rounded" style={{ backgroundColor: colorTexto, color: '#ffffff' }}>
              <p className="font-semibold">Texto de ejemplo con este color</p>
            </div>
          </div>
        </div>

        {/* Mensaje de Inicio */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary-600" />
            Mensaje de Inicio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={tituloInicio}
                onChange={(e) => setTituloInicio(e.target.value)}
                className="input"
                placeholder="🌸 Arreglos Florales Excepcionales"
              />
              <p className="text-xs text-gray-500 mt-1">Este título aparecerá en la página de inicio</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje/Descripción
              </label>
              <textarea
                value={mensajeInicio}
                onChange={(e) => setMensajeInicio(e.target.value)}
                className="input"
                rows="3"
                placeholder="Descubre nuestra colección única de arreglos florales artesanales"
              />
              <p className="text-xs text-gray-500 mt-1">Este mensaje aparecerá debajo del título en la página de inicio</p>
            </div>

            {/* Vista Previa del Mensaje */}
            <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista Previa:</p>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold" style={{ color: colorPrimario }}>
                  {tituloInicio || 'Título de ejemplo'}
                </h3>
                <p className="text-lg" style={{ color: colorTexto }}>
                  {mensajeInicio || 'Mensaje de ejemplo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-primary-600" />
            Información de Contacto
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección del Local
              </label>
              <input
                type="text"
                value={direccionEmpresa}
                onChange={(e) => setDireccionEmpresa(e.target.value)}
                className="input"
                placeholder="Ej: Calle 123 #45-67, Bogotá, Colombia"
              />
              <p className="text-xs text-gray-500 mt-1">Dirección física que aparecerá en Google Maps</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Principal
                </label>
                <input
                  type="text"
                  value={whatsappEmpresa1}
                  onChange={(e) => setWhatsappEmpresa1(e.target.value)}
                  className="input"
                  placeholder="+573001234567"
                />
                <p className="text-xs text-gray-500 mt-1">Número principal para contactar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Secundario (Opcional)
                </label>
                <input
                  type="text"
                  value={whatsappEmpresa2}
                  onChange={(e) => setWhatsappEmpresa2(e.target.value)}
                  className="input"
                  placeholder="+573001234568"
                />
                <p className="text-xs text-gray-500 mt-1">Número alternativo (opcional)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vista Previa del Tema */}
        <div className="card p-4 sm:p-6 bg-gray-50">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-600" />
            Vista Previa del Tema Completo
          </h3>
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
            <div className="p-4 rounded-lg border-2 border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <p className="font-semibold" style={{ color: colorTexto }}>Texto con color personalizado</p>
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
              setColorTexto('#1f2937');
              setTituloInicio('🌸 Arreglos Florales Excepcionales');
              setMensajeInicio('Descubre nuestra colección única de arreglos florales artesanales');
              setDireccionEmpresa('');
              setWhatsappEmpresa1('');
              setWhatsappEmpresa2('');
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

