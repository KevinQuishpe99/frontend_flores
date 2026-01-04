import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login, register } from '../api/auth';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { normalizarTelefono } from '../utils/phoneUtils';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login(formData.email, formData.password);
      } else {
        response = await register({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono ? normalizarTelefono(formData.telefono) : formData.telefono,
        });
      }

      setAuth(response.user, response.token);
      toast.success(`¡Bienvenido, ${response.user.nombre}!`);
      
      // Redirigir según rol
      if (response.user.rol === 'ADMIN') {
        navigate('/admin/usuarios');
      } else if (response.user.rol === 'GERENTE') {
        navigate('/gerente/pedidos');
      } else if (response.user.rol === 'EMPLEADO') {
        navigate('/empleado/pedidos');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al autenticarse');
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // Verificar que el clientId no esté vacío
  const hasValidGoogleClientId = googleClientId && googleClientId.trim() !== '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl mb-4">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Flores
          </h2>
          <p className="text-gray-600 font-medium text-lg">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
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
                    placeholder="Tu nombre"
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
                    placeholder="Tu apellido"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Teléfono * <span className="text-xs text-gray-500 font-normal">(Para contacto por WhatsApp)</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={formData.telefono || '+57'}
                      onChange={(value) => {
                        setFormData({ ...formData, telefono: value });
                      }}
                    />
                    <input
                      type="tel"
                      value={formData.telefono?.replace(/^\+\d{1,3}\s?/, '') || ''}
                      onChange={(e) => {
                        const numero = e.target.value.replace(/[^0-9]/g, '');
                        const codigo = formData.telefono?.match(/^(\+\d{1,3})/)?.[1] || '+57';
                        setFormData({ ...formData, telefono: codigo + ' ' + numero });
                      }}
                      className="input flex-1"
                      required={!isLogin}
                      placeholder="300 123 4567"
                      pattern="[0-9]{7,12}"
                      title="Ingresa solo números (sin espacios ni guiones)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El número debe incluir código de país para WhatsApp
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pr-10"
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-600 transition-colors duration-300 p-1 rounded-lg hover:bg-primary-50"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3.5 text-lg font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </motion.button>
          </form>

          {hasValidGoogleClientId && <GoogleLoginButton />}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <motion.button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', nombre: '', apellido: '', telefono: '' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-primary-600 hover:text-primary-700 font-bold transition-colors duration-300"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
