import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import InstallButton from './InstallButton';
import {
  HomeIcon,
  UserCircleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin/usuarios', label: 'Usuarios', icon: UserCircleIcon },
    { path: '/admin/arreglos', label: 'Arreglos', icon: SparklesIcon },
    { path: '/admin/pedidos', label: 'Pedidos', icon: ClipboardDocumentListIcon },
    { path: '/gerente/stock', label: 'Inventario', icon: ShoppingBagIcon },
    { path: '/gerente/tipos', label: 'Tipos', icon: SparklesIcon },
    { path: '/admin/contabilidad', label: 'Contabilidad', icon: ShoppingBagIcon },
    { path: '/admin/configuracion', label: 'Configuración', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-56 xl:w-64 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-14 xl:h-16 px-4 xl:px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl xl:text-2xl">🌸</span>
              <span className="text-lg xl:text-xl font-bold text-primary-600">Flores</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 xl:px-4 py-4 xl:py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 xl:px-4 py-2.5 xl:py-3 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 xl:w-5 xl:h-5 mr-2.5 xl:mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section - Desktop */}
          <div className="border-t border-gray-200 p-3 xl:p-4">
            <div className="flex items-center space-x-2 xl:space-x-3 mb-2 xl:mb-3">
              <img
                className="h-8 w-8 xl:h-10 xl:w-10 rounded-full object-cover flex-shrink-0"
                src={user?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`}
                alt={user?.nombre || 'Usuario'}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs xl:text-sm font-medium text-gray-900 truncate">{user?.nombre || 'Usuario'} {user?.apellido || ''}</p>
                <p className="text-xs text-gray-500 truncate hidden xl:block">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline">Cerrar Sesión</span>
              <span className="xl:hidden">Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-floral-50">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
              <span className="text-xl sm:text-2xl">🌸</span>
              <span className="text-lg sm:text-xl font-bold text-primary-600">Flores Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-white/50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 sm:px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section - Mobile */}
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
            <div className="flex items-center space-x-3 mb-3">
              <img
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md"
                src={user?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`}
                alt={user?.nombre || 'Usuario'}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombre || '') + ' ' + (user?.apellido || ''))}`;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user?.nombre || 'Usuario'} {user?.apellido || ''}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors active:scale-95"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl">🌸</span>
            <span className="text-lg sm:text-xl font-bold text-primary-600">Admin</span>
          </Link>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Botón de Instalación PWA */}
      <InstallButton />
    </div>
  );
}

