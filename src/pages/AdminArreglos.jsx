import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArreglos, createArreglo, updateArreglo, deleteArreglo } from '../api/arreglos';
import { actualizarPreciosMasivo } from '../api/admin';
import { getTiposArreglo } from '../api/tiposArreglo';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import MultiImageUpload from '../components/MultiImageUpload';
import { PlusIcon, PencilIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';

export default function AdminArreglos() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingArreglo, setEditingArreglo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: '',
    disponible: true,
    tipoId: '',
  });
  const [imagen, setImagen] = useState(null);
  const [imagenEditada, setImagenEditada] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imagenesAdicionales, setImagenesAdicionales] = useState([]);
  const [showPreciosModal, setShowPreciosModal] = useState(false);
  const [porcentajeAumento, setPorcentajeAumento] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(true);

  const { data: arreglos = [], isLoading } = useQuery({
    queryKey: ['arreglos'],
    queryFn: () => getArreglos(),
  });

  const { data: tiposArreglo = [] } = useQuery({
    queryKey: ['tipos-arreglo'],
    queryFn: getTiposArreglo,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createArreglo(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arreglos']);
      toast.success('Arreglo creado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear arreglo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateArreglo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arreglos']);
      toast.success('Arreglo actualizado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar arreglo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries(['arreglos']);
      toast.success('Arreglo eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar arreglo');
    },
  });

  const actualizarPreciosMutation = useMutation({
    mutationFn: ({ porcentaje, soloDisponibles }) => actualizarPreciosMasivo(porcentaje, soloDisponibles),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['arreglos']);
      toast.success(`Precios actualizados: ${data.arreglosActualizados} arreglos con ${data.porcentajeAplicado}% de aumento`);
      setShowPreciosModal(false);
      setPorcentajeAumento('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar precios');
    },
  });

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', costo: '', disponible: true, tipoId: '' });
    setImagen(null);
    setImagenEditada(null);
    setPreviewImage(null);
    setImagenesAdicionales([]);
    setEditingArreglo(null);
    setShowForm(false);
  };

  const handleImageSelect = (file, editedImageDataUrl) => {
    if (file) {
      setImagen(file);
    }
    if (editedImageDataUrl) {
      setImagenEditada(editedImageDataUrl);
      setPreviewImage(editedImageDataUrl);
    } else if (!file && !editedImageDataUrl) {
      setImagen(null);
      setImagenEditada(null);
      setPreviewImage(null);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('costo', formData.costo);
    data.append('disponible', formData.disponible);
    
    // El creador se asigna automáticamente al usuario actual en el backend
    // Agregar tipo de arreglo
    if (formData.tipoId) {
      data.append('tipoId', formData.tipoId);
    }

    // Si hay imagen editada (data URL), convertirla a archivo y enviarla
    if (imagenEditada && imagenEditada.startsWith('data:')) {
      try {
        // Enviar la data URL directamente para que el backend la procese
        data.append('imagenEditada', imagenEditada);
        
        // También convertir a File para enviar como imagen principal
        const response = await fetch(imagenEditada);
        if (!response.ok) throw new Error('Error al obtener imagen');
        
        const blob = await response.blob();
        const file = new File([blob], 'imagen-editada.jpg', { type: 'image/jpeg' });
        data.append('imagen', file);
      } catch (error) {
        console.error('Error al procesar imagen editada:', error);
        toast.error('Error al procesar la imagen editada. Intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }
    } else if (imagen) {
      if (imagen instanceof File) {
        try {
          const { compressImage } = await import('../utils/imageCompression');
          const compressedFile = await compressImage(imagen, 1920, 1920, 0.85);
          data.append('imagen', compressedFile);
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          data.append('imagen', imagen);
        }
      } else {
        data.append('imagen', imagen);
      }
    }

    // Agregar imágenes adicionales (solo las nuevas, no las que ya tienen URL)
    imagenesAdicionales.forEach((img, index) => {
      if (img.file) {
        data.append(`imagenAdicional_${index}`, img.file);
      }
    });

    try {
      if (editingArreglo) {
        await updateMutation.mutateAsync({ id: editingArreglo.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar el arreglo';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (arreglo) => {
    setEditingArreglo(arreglo);
    setFormData({
      nombre: arreglo.nombre,
      descripcion: arreglo.descripcion || '',
      costo: arreglo.costo,
      disponible: arreglo.disponible,
      tipoId: arreglo.tipoId || '',
    });
    const currentImageUrl = arreglo.imagenEditada || arreglo.imagen;
    setImagenEditada(currentImageUrl);
    setPreviewImage(getImageUrl(currentImageUrl));
    setImagenesAdicionales((arreglo.imagenesAdicionales || []).map(url => ({ url, preview: url, file: null })));
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  const handleActualizarPrecios = (e) => {
    e.preventDefault();
    const porcentaje = parseFloat(porcentajeAumento);
    if (!porcentaje || porcentaje <= 0) {
      toast.error('El porcentaje debe ser mayor a 0');
      return;
    }
    actualizarPreciosMutation.mutate({ porcentaje, soloDisponibles });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Arreglos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreciosModal(true)}
            className="btn-secondary flex items-center"
          >
            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
            Actualizar Precios
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Arreglo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingArreglo ? 'Editar Arreglo' : 'Nuevo Arreglo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo
                </label>
                <input
                  type="number"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                  className="input"
                  required
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Arreglo
              </label>
              <select
                value={formData.tipoId}
                onChange={(e) => setFormData({ ...formData, tipoId: e.target.value })}
                className="input w-full"
              >
                <option value="">Sin tipo</option>
                {tiposArreglo.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={editingArreglo ? getImageUrl(editingArreglo.imagenEditada || editingArreglo.imagen) : null}
              label="Imagen Principal del Arreglo"
              required={!editingArreglo}
            />

            <MultiImageUpload
              onImagesChange={setImagenesAdicionales}
              currentImages={imagenesAdicionales}
              label="Galería de Imágenes Adicionales"
              maxImages={5}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponible"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                Disponible
              </label>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                className="btn-primary flex-1"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              >
                {isSubmitting || createMutation.isPending || updateMutation.isPending 
                  ? 'Guardando...' 
                  : editingArreglo 
                    ? 'Actualizar' 
                    : 'Crear'
                }
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {arreglos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No hay arreglos en el catálogo</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Crear Primer Arreglo
            </button>
          </div>
        ) : (
          arreglos.map((arreglo) => (
            <div key={arreglo.id} className="card">
              <img
                src={getImageUrl(arreglo.imagenEditada || arreglo.imagen)}
                alt={arreglo.nombre}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error('Error al cargar imagen:', arreglo.imagen);
                  e.target.style.display = 'none';
                }}
              />
              <h3 className="font-semibold text-lg mb-2">{arreglo.nombre}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {arreglo.descripcion}
              </p>
              <p className="text-primary-600 font-bold text-xl mb-2">
                ${arreglo.costo.toLocaleString()}
              </p>
              {arreglo.creador && (
                <p className="text-xs text-gray-500 mb-4">
                  Por: {arreglo.creador.nombre} {arreglo.creador.apellido || ''} ({arreglo.creador.rol})
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(arreglo)}
                  className="flex-1 btn-secondary flex items-center justify-center text-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de eliminar este arreglo?')) {
                      deleteMutation.mutate(arreglo.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Actualización Masiva de Precios */}
      {showPreciosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Actualizar Precios Masivamente</h2>
            <form onSubmit={handleActualizarPrecios} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Aumento (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={porcentajeAumento}
                  onChange={(e) => setPorcentajeAumento(e.target.value)}
                  className="input w-full"
                  placeholder="Ej: 10, 15, 20"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: 10 = 10% de aumento, 15 = 15% de aumento
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="soloDisponibles"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="soloDisponibles" className="text-sm font-medium text-gray-700">
                  Solo arreglos disponibles
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Advertencia:</strong> Esta acción actualizará los precios de{' '}
                  {soloDisponibles 
                    ? arreglos.filter(a => a.disponible).length 
                    : arreglos.length
                  } arreglo(s). Los pedidos existentes mantendrán su precio original.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={actualizarPreciosMutation.isPending}
                >
                  {actualizarPreciosMutation.isPending ? 'Actualizando...' : 'Aplicar Aumento'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreciosModal(false);
                    setPorcentajeAumento('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={actualizarPreciosMutation.isPending}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

