import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUsuario, getUsuarios, updateUsuario, deleteUsuario } from '../api/admin';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { normalizarTelefono } from '../utils/phoneUtils';

const ROLES = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  EMPLEADO: 'Empleado',
  CLIENTE: 'Cliente',
};

export default function AdminUsuarios() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'CLIENTE',
    telefono: '',
    direccion: '',
    activo: true,
  });

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => getUsuarios(),
  });

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      toast.success('Usuario creado exitosamente');
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      toast.success('Usuario actualizado');
      setEditingUser(null);
      resetForm();
    },
    onError: () => {
      toast.error('Error al actualizar usuario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      toast.success('Usuario eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar usuario');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'CLIENTE',
      telefono: '',
      direccion: '',
      activo: true,
    });
    setShowPassword(false);
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setShowCreateForm(false);
    setFormData({
      email: usuario.email,
      password: '',
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      rol: usuario.rol,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      activo: usuario.activo,
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowCreateForm(true);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normalizar teléfono antes de enviar
    const dataToSend = {
      ...formData,
      telefono: formData.telefono ? normalizarTelefono(formData.telefono) : formData.telefono,
    };
    
    if (editingUser) {
      // Editar usuario existente (sin password a menos que se cambie)
      const updateData = { ...dataToSend };
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.email; // No se puede cambiar el email
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      // Crear nuevo usuario
      createMutation.mutate(dataToSend);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {(editingUser || showCreateForm) && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email {!editingUser && '*'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required={!editingUser}
                  disabled={!!editingUser}
                  placeholder="usuario@ejemplo.com"
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {!editingUser && '*'}
                  {editingUser && <span className="text-gray-500 text-xs">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input pr-10"
                    required={!editingUser}
                    minLength={6}
                    placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                  required
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="input"
                  placeholder="Apellido del usuario"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="input"
                required
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                  <span className="text-xs text-gray-500 ml-2">(Para contacto por WhatsApp)</span>
                </label>
                <CountryCodeSelector
                  value={formData.telefono || '+57 '}
                  onChange={(value) => {
                    setFormData({ ...formData, telefono: value });
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El número debe incluir código de país para WhatsApp
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : editingUser
                  ? 'Actualizar Usuario'
                  : 'Crear Usuario'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={usuario.imagen || `https://ui-avatars.com/api/?name=${usuario.nombre}`}
                      alt={usuario.nombre}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ROLES[usuario.rol]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
                        deleteMutation.mutate(usuario.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

