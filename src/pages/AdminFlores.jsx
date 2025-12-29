import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlores, createFlor, updateFlor, deleteFlor } from '../api/flores';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';
import ImageUpload from '../components/ImageUpload';

const TEMPORADAS = {
  PRIMAVERA: 'Primavera',
  VERANO: 'Verano',
  OTONO: 'Otoño',
  INVIERNO: 'Invierno',
  TODO_EL_ANIO: 'Todo el año',
};

export default function AdminFlores() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingFlor, setEditingFlor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    temporada: 'TODO_EL_ANIO',
    costoBase: '',
    disponible: true,
  });
  const [imagen, setImagen] = useState(null);
  const [imagenEditada, setImagenEditada] = useState(null);

  const { data: flores = [], isLoading } = useQuery({
    queryKey: ['flores'],
    queryFn: () => getFlores(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createFlor(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['flores']);
      toast.success('Flor creada exitosamente');
      resetForm();
    },
    onError: () => {
      toast.error('Error al crear flor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFlor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['flores']);
      toast.success('Flor actualizada exitosamente');
      resetForm();
    },
    onError: () => {
      toast.error('Error al actualizar flor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlor,
    onSuccess: () => {
      queryClient.invalidateQueries(['flores']);
      toast.success('Flor eliminada exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar flor');
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      temporada: 'TODO_EL_ANIO',
      costoBase: '',
      disponible: true,
    });
    setImagen(null);
    setImagenEditada(null);
    setEditingFlor(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('nombre', formData.nombre);
    if (formData.descripcion) {
      data.append('descripcion', formData.descripcion);
    }
    data.append('temporada', formData.temporada);
    data.append('costoBase', formData.costoBase);
    data.append('disponible', formData.disponible);

    // Agregar imagen si existe (comprimida)
    // Priorizar imagen editada (data URL) si existe
    if (imagenEditada && imagenEditada.startsWith('data:')) {
      try {
        const { compressImage } = await import('../utils/imageCompression');
        const response = await fetch(imagenEditada);
        const blob = await response.blob();
        const tempFile = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
        // Comprimir antes de agregar
        const compressedFile = await compressImage(tempFile, 1920, 1920, 0.85);
        data.append('imagen', compressedFile);
      } catch (error) {
        console.error('Error al comprimir imagen editada:', error);
        // Fallback: usar sin compresión adicional
        try {
          const response = await fetch(imagenEditada);
          const blob = await response.blob();
          const file = new File([blob], 'imagen-editada.jpg', { type: 'image/jpeg' });
          data.append('imagen', file);
        } catch (err) {
          if (imagen && imagen instanceof File) {
            data.append('imagen', imagen);
          }
        }
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
      } 
      // Si es un data URL (string), convertirlo y comprimirlo
      else if (typeof imagen === 'string' && imagen.startsWith('data:')) {
        try {
          const { compressImage } = await import('../utils/imageCompression');
          const response = await fetch(imagen);
          const blob = await response.blob();
          const tempFile = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
          const compressedFile = await compressImage(tempFile, 1920, 1920, 0.85);
          data.append('imagen', compressedFile);
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          toast.error('Error al procesar la imagen');
          return;
        }
      }
    }

    if (editingFlor) {
      updateMutation.mutate({ id: editingFlor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (flor) => {
    setEditingFlor(flor);
    setFormData({
      nombre: flor.nombre,
      descripcion: flor.descripcion || '',
      temporada: flor.temporada,
      costoBase: flor.costoBase,
      disponible: flor.disponible,
    });
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Flores</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Flor
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingFlor ? 'Editar Flor' : 'Nueva Flor'}
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
                  Temporada
                </label>
                <select
                  value={formData.temporada}
                  onChange={(e) => setFormData({ ...formData, temporada: e.target.value })}
                  className="input"
                >
                  {Object.entries(TEMPORADAS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Base
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costoBase}
                  onChange={(e) => setFormData({ ...formData, costoBase: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <ImageUpload
              onImageSelect={(file, editedImageDataUrl) => {
                if (file) {
                  setImagen(file);
                }
                if (editedImageDataUrl) {
                  setImagenEditada(editedImageDataUrl);
                  // Si no hay file pero sí data URL, usar la data URL
                  if (!file) {
                    setImagen(editedImageDataUrl);
                  }
                } else if (!file && !editedImageDataUrl) {
                  setImagen(null);
                  setImagenEditada(null);
                }
              }}
              currentImage={editingFlor ? getImageUrl(editingFlor.imagen) : null}
              label="Imagen de la Flor"
              required={!editingFlor}
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
              <button type="submit" className="btn-primary flex-1">
                {editingFlor ? 'Actualizar' : 'Crear'}
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
        {flores.map((flor) => (
          <div key={flor.id} className="card">
            {flor.imagen && (
              <img
                src={getImageUrl(flor.imagen)}
                alt={flor.nombre}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error('Error al cargar imagen:', flor.imagen);
                  e.target.style.display = 'none';
                }}
              />
            )}
            <h3 className="font-semibold text-lg mb-2">{flor.nombre}</h3>
            <p className="text-gray-600 text-sm mb-2">
              Temporada: {TEMPORADAS[flor.temporada]}
            </p>
            <p className="text-primary-600 font-bold text-xl mb-4">
              ${flor.costoBase.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(flor)}
                className="flex-1 btn-secondary flex items-center justify-center text-sm"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Editar
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de eliminar esta flor?')) {
                    deleteMutation.mutate(flor.id);
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
    </div>
  );
}

