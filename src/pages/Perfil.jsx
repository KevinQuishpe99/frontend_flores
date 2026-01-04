import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { normalizarTelefono } from '../utils/phoneUtils';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Mi Perfil
        </h1>
        <p className="text-gray-600 text-lg">Gestiona tu información personal</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <img
              className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-primary-100"
              src={imagenPreview || perfil?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent((perfil?.nombre || '') + ' ' + (perfil?.apellido || ''))}&background=random`}
              alt={perfil?.nombre}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full p-3 hover:from-primary-600 hover:to-primary-700 transition-all shadow-xl border-4 border-white"
              title="Cambiar foto de perfil"
            >
              <CameraIcon className="w-5 h-5" />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              {perfil?.nombre} {perfil?.apellido}
            </h2>
            <p className="text-gray-600 text-lg mb-3">{perfil?.email}</p>
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full shadow-lg">
              {perfil?.rol}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre *
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
              <label className="block text-sm font-bold text-gray-700 mb-2">
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Teléfono {user?.rol === 'CLIENTE' && <span className="text-red-500">*</span>}
              <span className="text-xs text-gray-500 ml-2 font-normal">(Para contacto por WhatsApp)</span>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Dirección
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="input"
              rows="4"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={updateMutation.isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

