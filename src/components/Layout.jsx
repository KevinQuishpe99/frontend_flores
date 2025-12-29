import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
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

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  
  const cartItemCount = getItemCount();

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">🌸 Flores</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive(item.path)
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Carrito - Solo para clientes */}
                  {isAuthenticated && user?.rol === 'CLIENTE' && (
                    <button
                      onClick={() => setCartOpen(true)}
                      className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                      title="Carrito"
                    >
                      <ShoppingCartIcon className="w-6 h-6" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemCount > 9 ? '9+' : cartItemCount}
                        </span>
                      )}
                    </button>
                  )}
                  
                  {/* Notificaciones - Para gerente, empleado y admin */}
                  {isAuthenticated && (user?.rol === 'GERENTE' || user?.rol === 'EMPLEADO' || user?.rol === 'ADMIN') && (
                    <Notificaciones />
                  )}
              
              {isAuthenticated ? (
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user?.imagen || `https://ui-avatars.com/api/?name=${user?.nombre}`}
                      alt={user?.nombre}
                    />
                    <span className="ml-2 text-gray-700 font-medium hidden sm:block">
                      {user?.nombre}
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/perfil"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <UserCircleIcon className="w-5 h-5 mr-2" />
                            Perfil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
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
                  className="btn-primary"
                >
                  Iniciar Sesión
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
    </div>
  );
}

