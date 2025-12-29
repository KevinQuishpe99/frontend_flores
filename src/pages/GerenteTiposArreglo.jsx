import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposArreglo, createTipoArreglo, updateTipoArreglo, deleteTipoArreglo } from '../api/tiposArreglo';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function GerenteTiposArreglo() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ['tipos-arreglo'],
    queryFn: getTiposArreglo,
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createTipoArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries(['tipos-arreglo']);
      toast.success('Tipo de arreglo creado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear tipo de arreglo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTipoArreglo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tipos-arreglo']);
      toast.success('Tipo de arreglo actualizado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar tipo de arreglo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTipoArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries(['tipos-arreglo']);
      toast.success('Tipo de arreglo eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar tipo de arreglo');
    },
  });

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingTipo(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTipo) {
      updateMutation.mutate({ id: editingTipo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
    });
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tipos de Arreglos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gestiona los tipos de arreglos (centros de mesa, ramos, etc.)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center justify-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Tipo
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 sm:mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input w-full"
                required
                placeholder="Ej: Centros de Mesa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input w-full"
                rows="3"
                placeholder="Descripción del tipo de arreglo..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : editingTipo
                    ? 'Actualizar'
                    : 'Crear'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {tipos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg">No hay tipos de arreglos aún.</p>
            <p>Haz clic en "Nuevo Tipo" para empezar.</p>
          </div>
        ) : (
          tipos.map((tipo) => (
            <div key={tipo.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{tipo.nombre}</h3>
                {tipo._count?.arreglos > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tipo._count.arreglos} arreglos
                  </span>
                )}
              </div>
              {tipo.descripcion && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tipo.descripcion}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tipo)}
                  className="flex-1 btn-secondary flex items-center justify-center text-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (tipo._count?.arreglos > 0) {
                      toast.error('No se puede eliminar un tipo que tiene arreglos asociados');
                    } else if (window.confirm('¿Estás seguro de eliminar este tipo?')) {
                      deleteMutation.mutate(tipo.id);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center text-sm ${
                    tipo._count?.arreglos > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } px-3 py-2 rounded-lg`}
                  disabled={tipo._count?.arreglos > 0}
                  title={tipo._count?.arreglos > 0 ? 'No se puede eliminar: tiene arreglos asociados' : 'Eliminar'}
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

