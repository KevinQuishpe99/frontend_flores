import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import Cart from './Cart';
import Notificaciones from './Notificaciones';
import InstallButton from './InstallButton';
import { useQuery } from '@tanstack/react-query';
import { getConfiguraciones } from '../api/configuracion';

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  
  const cartItemCount = getItemCount();

  // Obtener logo de configuraciones
  const { data: configData } = useQuery({
    queryKey: ['configuraciones-public'],
    queryFn: () => getConfiguraciones(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const configuraciones = configData?.data || {};
  const logo = configuraciones.logo || null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Inicio', icon: HomeIcon },
    { path: '/catalogo', label: 'Catálogo', icon: SparklesIcon },
  ];

  if (isAuthenticated) {
    if (user?.rol === 'CLIENTE') {
      navItems.push(
        { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { path: '/mis-pedidos', label: 'Mis Pedidos', icon: ShoppingBagIcon }
      );
    }
    if (user?.rol === 'GERENTE') {
      navItems.push(
        { path: '/gerente/pedidos', label: 'Pedidos', icon: ClipboardDocumentListIcon },
        { path: '/gerente/stock', label: 'Inventario', icon: ShoppingBagIcon },
        { path: '/gerente/tipos', label: 'Tipos', icon: SparklesIcon },
        { path: '/gerente/contabilidad', label: 'Contabilidad', icon: ShoppingBagIcon }
      );
    }
    if (user?.rol === 'EMPLEADO') {
      navItems.push(
        { path: '/empleado/pedidos', label: 'Mis Pedidos', icon: ClipboardDocumentListIcon },
        { path: '/empleado/stock', label: 'Stock', icon: ShoppingBagIcon }
      );
    }
    if (user?.rol === 'ADMIN') {
      navItems.push(
        { path: '/admin/usuarios', label: 'Usuarios', icon: UserCircleIcon },
        { path: '/admin/arreglos', label: 'Arreglos', icon: SparklesIcon },
        { path: '/admin/pedidos', label: 'Pedidos', icon: ClipboardDocumentListIcon },
        { path: '/gerente/stock', label: 'Inventario', icon: ShoppingBagIcon },
        { path: '/gerente/tipos', label: 'Tipos', icon: SparklesIcon },
        { path: '/admin/contabilidad', label: 'Contabilidad', icon: ShoppingBagIcon },
        { path: '/admin/configuracion', label: 'Configuración', icon: Cog6ToothIcon }
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-18">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2.5 group">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-10 sm:h-12 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">🌸</span>
                )}
                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Flores
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-2 transition-transform duration-300 ${isActive(item.path) ? '' : 'group-hover:scale-110'}`} />
                      {item.label}
                      {isActive(item.path) && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Carrito - Solo para clientes */}
              {isAuthenticated && user?.rol === 'CLIENTE' && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-300 group"
                  title="Carrito"
                >
                  <ShoppingCartIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </motion.span>
                  )}
                </button>
              )}
              
              {/* Notificaciones - Para gerente, empleado y admin */}
              {isAuthenticated && (user?.rol === 'GERENTE' || user?.rol === 'EMPLEADO' || user?.rol === 'ADMIN') && (
                <Notificaciones />
              )}
          
              {isAuthenticated ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200 hover:ring-primary-500 transition-all duration-300"
                      src={user?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`}
                      alt={user?.nombre || 'Usuario'}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`;
                      }}
                    />
                    <span className="text-gray-700 font-bold hidden sm:block text-sm">
                      {user?.nombre || 'Usuario'} {user?.apellido || ''}
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95 translate-y-2"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 translate-y-2"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-black/5 focus:outline-none border border-gray-100">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/perfil"
                            className={`${
                              active ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700' : 'text-gray-700'
                            } flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200`}
                          >
                            <UserCircleIcon className="w-5 h-5 mr-3" />
                            Perfil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                            } flex items-center w-full px-4 py-3 text-sm font-semibold transition-all duration-200`}
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                            Cerrar Sesión
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Link
                  to="/login"
                  className="group relative bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Iniciar Sesión</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      
      {/* Carrito Modal */}
      {isAuthenticated && user?.rol === 'CLIENTE' && (
        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}
      
      {/* Botón de Instalación PWA */}
      <InstallButton />
    </div>
  );
}

