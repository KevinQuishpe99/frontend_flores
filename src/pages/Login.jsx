import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login, register } from '../api/auth';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { normalizarTelefono } from '../utils/phoneUtils';
import GoogleLoginButton from '../components/GoogleLoginButton';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-floral-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-2">
            🌸 Flores
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </p>
        </div>

        <div className="card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
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
                    placeholder="Tu nombre"
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
                    placeholder="Tu apellido"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono * <span className="text-xs text-gray-500">(Para contacto por WhatsApp)</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          {hasValidGoogleClientId && <GoogleLoginButton />}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', nombre: '', apellido: '', telefono: '' });
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
