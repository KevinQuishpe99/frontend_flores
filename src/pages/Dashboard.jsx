import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/auth';
import { getPedidos } from '../api/pedidos';
import { getArreglos } from '../api/arreglos';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUrl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: perfil } = useQuery({
    queryKey: ['perfil'],
    queryFn: getProfile,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: () => getPedidos(),
    enabled: user?.rol === 'CLIENTE',
  });

  const { data: arreglosFavoritos = [] } = useQuery({
    queryKey: ['arreglos-favoritos', favoritos],
    queryFn: () => getArreglos({ disponible: true }),
    enabled: favoritos.length > 0,
    select: (data) => data.filter(arreglo => favoritos.includes(arreglo.id)),
  });

  const pedidosRecientes = pedidos.slice(0, 5);
  const pedidosPendientes = pedidos.filter(p => 
    ['PENDIENTE', 'TRANSFERENCIA_VERIFICADA', 'ASIGNADO', 'EN_PROCESO'].includes(p.estado)
  );
  const pedidosCompletados = pedidos.filter(p => p.estado === 'COMPLETADO');

  const toggleFavorito = (arregloId) => {
    const nuevosFavoritos = favoritos.includes(arregloId)
      ? favoritos.filter(id => id !== arregloId)
      : [...favoritos, arregloId];
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
  };

  if (user?.rol !== 'CLIENTE') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Esta página es solo para clientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Mi Dashboard
        </h1>
        <p className="text-gray-600 text-lg font-medium">Bienvenido, {perfil?.nombre} 👋</p>
      </motion.div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl border border-blue-400/20 p-6 sm:p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sm:text-base font-bold text-blue-100 mb-2">Pedidos Totales</p>
              <p className="text-4xl sm:text-5xl font-black">{pedidos.length}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <ShoppingBagIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl border border-yellow-400/20 p-6 sm:p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sm:text-base font-bold text-yellow-100 mb-2">Pedidos Pendientes</p>
              <p className="text-4xl sm:text-5xl font-black">{pedidosPendientes.length}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <ClockIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl border border-green-400/20 p-6 sm:p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sm:text-base font-bold text-green-100 mb-2">Pedidos Completados</p>
              <p className="text-4xl sm:text-5xl font-black">{pedidosCompletados.length}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pedidos Recientes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Pedidos Recientes</h2>
            <Link
              to="/mis-pedidos"
              className="text-primary-600 hover:text-primary-700 text-sm font-bold transition-colors duration-300"
            >
              Ver todos →
            </Link>
          </div>
          {pedidosRecientes.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tienes pedidos aún</p>
              <Link
                to="/catalogo"
                className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosRecientes.map((pedido) => (
                <Link
                  key={pedido.id}
                  to={`/pedido/${pedido.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 80, height: 80 })}
                      alt={pedido.arreglo.nombre}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pedido.arreglo.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(pedido.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                        pedido.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pedido.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Favoritos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <HeartIconSolid className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              Mis Favoritos
            </h2>
            <Link
              to="/catalogo"
              className="text-primary-600 hover:text-primary-700 text-sm font-bold transition-colors duration-300"
            >
              Explorar →
            </Link>
          </div>
          {arreglosFavoritos.length === 0 ? (
            <div className="text-center py-8">
              <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tienes favoritos aún</p>
              <p className="text-sm text-gray-500 mt-1">
                Agrega arreglos a favoritos desde el catálogo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {arreglosFavoritos.map((arreglo) => (
                <Link
                  key={arreglo.id}
                  to={`/arreglo/${arreglo.id}`}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <img
                      src={getImageUrl(arreglo.imagenEditada || arreglo.imagen, { width: 200, height: 200 })}
                      alt={arreglo.nombre}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorito(arreglo.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                    >
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{arreglo.nombre}</h3>
                    <p className="text-primary-600 font-bold">${arreglo.costo.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Información del Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mt-8"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Mi Información</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <UserIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-semibold">{perfil?.nombre} {perfil?.apellido}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{perfil?.email}</p>
            </div>
          </div>
          {perfil?.telefono && (
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-semibold">{perfil.telefono}</p>
              </div>
            </div>
          )}
          {perfil?.direccion && (
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <MapPinIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-semibold">{perfil.direccion}</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Editar Perfil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

