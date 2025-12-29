import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { normalizarTelefono } from '../utils/phoneUtils';
import { CameraIcon } from '@heroicons/react/24/outline';

export default function Perfil() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
  });
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const fileInputRef = useRef(null);

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: getProfile,
    onSuccess: (data) => {
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
      });
      // No establecer preview de imagen existente, se mostrará desde perfil?.imagen
      setImagenPreview(null);
      setImagenFile(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['perfil']);
      setAuth(data, useAuthStore.getState().token);
      toast.success('Perfil actualizado exitosamente');
      
      // Redirigir según el rol después de guardar cambios
      if (data.rol === 'CLIENTE') {
        // Si es cliente, redirigir al catálogo/home para hacer pedidos
        navigate('/');
      } else if (data.rol === 'ADMIN') {
        navigate('/admin/usuarios');
      } else if (data.rol === 'GERENTE') {
        navigate('/gerente/pedidos');
      } else if (data.rol === 'EMPLEADO') {
        navigate('/empleado/pedidos');
      }
    },
    onError: () => {
      toast.error('Error al actualizar perfil');
    },
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target.result);
      setImagenFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normalizar teléfono antes de enviar
    const telefonoNormalizado = formData.telefono ? normalizarTelefono(formData.telefono) : formData.telefono;
    
    // Crear FormData si hay imagen, sino enviar JSON normal
    if (imagenFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('apellido', formData.apellido || '');
      formDataToSend.append('telefono', telefonoNormalizado || '');
      formDataToSend.append('direccion', formData.direccion || '');
      formDataToSend.append('imagen', imagenFile);
      updateMutation.mutate(formDataToSend);
    } else {
      const dataToSend = {
        ...formData,
        telefono: telefonoNormalizado,
      };
      updateMutation.mutate(dataToSend);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="card">
        <div className="flex items-center mb-6">
          <div className="relative">
            <img
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              src={imagenPreview || perfil?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent((perfil?.nombre || '') + ' ' + (perfil?.apellido || ''))}&background=random`}
              alt={perfil?.nombre}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1.5 hover:bg-primary-700 transition-colors shadow-lg"
              title="Cambiar foto de perfil"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{perfil?.nombre} {perfil?.apellido}</h2>
            <p className="text-gray-600">{perfil?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {perfil?.rol}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono {user?.rol === 'CLIENTE' && <span className="text-red-500">*</span>}
              <span className="text-xs text-gray-500 ml-2">(Para contacto por WhatsApp)</span>
            </label>
            <CountryCodeSelector
              value={formData.telefono || '+57 '}
              onChange={(value) => {
                setFormData({ ...formData, telefono: value });
              }}
              className="w-full"
            />
            {user?.rol === 'CLIENTE' && !formData.telefono && (
              <p className="text-xs text-red-600 mt-1">
                El teléfono es obligatorio para clientes
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              El número debe incluir código de país para WhatsApp. Puedes cambiar el código de país desde el selector.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="input"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

