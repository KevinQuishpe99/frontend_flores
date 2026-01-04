import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArreglos, createArreglo, updateArreglo, deleteArreglo } from '../api/arreglos';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';

export default function FloristaArreglos() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingArreglo, setEditingArreglo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: '',
    disponible: true,
  });
  const [imagen, setImagen] = useState(null);
  const [imagenEditada, setImagenEditada] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: arreglos = [], isLoading } = useQuery({
    queryKey: ['arreglos'],
    queryFn: () => getArreglos(),
  });

  const misArreglos = arreglos.filter(a => a.creadorId === user?.id);

  const createMutation = useMutation({
    mutationFn: (data) => createArreglo(data),
    onSuccess: () => {
      // Invalidar todas las variantes de la query 'arreglos'
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      queryClient.invalidateQueries({ queryKey: ['arreglos-home'] });
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['arreglos'] });
      queryClient.refetchQueries({ queryKey: ['arreglos-home'] });
      toast.success('Arreglo creado exitosamente');
      resetForm();
    },
    onError: () => {
      toast.error('Error al crear arreglo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateArreglo(id, data),
    onSuccess: () => {
      // Invalidar todas las variantes de la query 'arreglos'
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      queryClient.invalidateQueries({ queryKey: ['arreglos-home'] });
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['arreglos'] });
      queryClient.refetchQueries({ queryKey: ['arreglos-home'] });
      toast.success('Arreglo actualizado exitosamente');
      resetForm();
    },
    onError: () => {
      toast.error('Error al actualizar arreglo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArreglo,
    onSuccess: () => {
      // Invalidar todas las variantes de la query 'arreglos'
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      queryClient.invalidateQueries({ queryKey: ['arreglos-home'] });
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['arreglos'] });
      queryClient.refetchQueries({ queryKey: ['arreglos-home'] });
      toast.success('Arreglo eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar arreglo');
    },
  });

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', costo: '', disponible: true });
    setImagen(null);
    setImagenEditada(null);
    setPreviewImage(null);
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
      // Si se elimina la imagen
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

    // Si hay imagen editada (data URL), enviarla directamente como data URL
    // El backend la subirá a Cloudinary
    if (imagenEditada && imagenEditada.startsWith('data:')) {
      data.append('imagenEditada', imagenEditada);
      // También enviar como archivo para compatibilidad (el backend priorizará imagenEditada)
      try {
        // Convertir data URL a blob sin usar fetch (para evitar CSP)
        const byteString = atob(imagenEditada.split(',')[1]);
        const mimeString = imagenEditada.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], 'imagen-editada.jpg', { type: 'image/jpeg' });
        data.append('imagen', file);
      } catch (error) {
        console.error('Error al convertir imagen editada a archivo:', error);
      }
    } else if (imagen) {
      // Si es un File, comprimirlo antes de agregar
      if (imagen instanceof File) {
        try {
          const { compressImage } = await import('../utils/imageCompression');
          const compressedFile = await compressImage(imagen, 1920, 1920, 0.85);
          data.append('imagen', compressedFile);
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          // Fallback: usar imagen original
          data.append('imagen', imagen);
        }
      } else {
        data.append('imagen', imagen);
      }
    }

    try {
      if (editingArreglo) {
        await updateMutation.mutateAsync({ id: editingArreglo.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
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
    });
    const currentImageUrl = arreglo.imagenEditada || arreglo.imagen;
    setImagenEditada(currentImageUrl);
    setPreviewImage(getImageUrl(currentImageUrl));
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Arreglos</h1>
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

            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={editingArreglo ? getImageUrl(editingArreglo.imagenEditada || editingArreglo.imagen) : null}
              label="Imagen del Arreglo"
              required
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
        {misArreglos.map((arreglo) => (
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
            <p className="text-primary-600 font-bold text-xl mb-4">
              ${arreglo.costo.toLocaleString()}
            </p>
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
        ))}
      </div>

      {misArreglos.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No has creado arreglos aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Crear Primer Arreglo
          </button>
        </div>
      )}
    </div>
  );
}

