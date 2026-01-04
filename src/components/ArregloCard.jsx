import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  ArrowRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getImageUrl } from '../utils/imageUrl';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ImageModal from './ImageModal';

export default function ArregloCard({ arreglo, index = 0, onImageClick, favoritos = [], onToggleFavorito }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCardClick = (arregloId) => {
    navigate(`/arreglo/${arregloId}`);
  };

  const handleImageClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const imageUrl = getImageUrl(arreglo.imagenEditada || arreglo.imagen);
    setSelectedImage(imageUrl);
    if (onImageClick) {
      onImageClick(imageUrl, arreglo);
    }
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      toast.error('Debes iniciar sesión como cliente para agregar al carrito');
      navigate('/login');
      return;
    }
    
    addItem(arreglo);
    toast.success(`${arreglo.nombre} agregado al carrito`);
  };

  const handlePedidoRapido = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      toast.error('Debes iniciar sesión como cliente para hacer un pedido');
      navigate('/login');
      return;
    }
    
    addItem(arreglo);
    navigate('/checkout');
  };

  const isFavorito = favoritos.includes(arreglo.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full backdrop-blur-sm"
      >
        {/* Imagen clicable para ver más grande */}
        <div 
          className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gradient-to-br from-primary-50 via-floral-50 to-pink-50 cursor-pointer flex-shrink-0"
          onClick={handleImageClick}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
          <img
            src={getImageUrl(arreglo.imagenEditada || arreglo.imagen, { width: 500, height: 500 })}
            alt={arreglo.nombre}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-110"
            loading="lazy"
          />
          
          {/* Overlay con gradiente animado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"></div>
          
          {/* Icono de zoom moderno */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-30">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              whileHover={{ scale: 1.1, rotate: 0 }}
              className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white/50"
            >
              <MagnifyingGlassIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
            </motion.div>
          </div>
          
          {/* Badge de tipo moderno */}
          {arreglo.tipo && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="absolute top-3 left-3 z-40" 
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold text-white shadow-xl border border-white/20">
                <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{arreglo.tipo.nombre}</span>
                <span className="sm:hidden">{arreglo.tipo.nombre.substring(0, 8)}</span>
              </span>
            </motion.div>
          )}
          
          {/* Botón de favoritos mejorado */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onToggleFavorito) {
                onToggleFavorito(arreglo.id, e);
              }
            }}
            className="absolute top-3 right-3 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-xl z-40 border border-white/50"
            title={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {isFavorito ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <HeartIconSolid className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </motion.div>
            ) : (
              <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-red-400 transition-colors" />
            )}
          </motion.button>
          
          {/* Precio destacado moderno */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute bottom-3 right-3 z-40" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-white via-white to-primary-50 backdrop-blur-md px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border-2 border-primary-200/50">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-500 font-medium">$</span>
                <span className="text-primary-600 font-black text-xl sm:text-2xl md:text-3xl tracking-tight">
                  {arreglo.costo.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Contenido de la card */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/50">
          <h3 
            className="font-extrabold text-lg sm:text-xl md:text-2xl text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-primary-600 transition-all duration-300 group-hover:translate-x-1"
            onClick={() => handleCardClick(arreglo.id)}
          >
            {arreglo.nombre}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-4 min-h-[3rem] flex-1 leading-relaxed">
            {arreglo.descripcion}
          </p>
          
          {/* Botones de Acción Modernos */}
          <div className="pt-4 border-t border-gray-200/50 mt-auto" onClick={(e) => e.stopPropagation()}>
            {isAuthenticated && user?.rol === 'CLIENTE' ? (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(arreglo.id);
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 text-sm py-3 flex items-center justify-center gap-2 transition-all duration-300 font-semibold rounded-xl shadow-sm hover:shadow-md"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Detalles</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 text-sm py-3 flex items-center justify-center gap-2 transition-all duration-300 font-semibold rounded-xl shadow-sm hover:shadow-md"
                  title="Agregar al carrito"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Carrito</span>
                  <span className="sm:hidden">Cart</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePedidoRapido}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm py-3 flex items-center justify-center gap-2 transition-all duration-300 font-bold rounded-xl shadow-lg hover:shadow-xl"
                  title="Pedido rápido"
                >
                  <span>Pedir Ahora</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(arreglo.id);
                }}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm py-3.5 flex items-center justify-center gap-2 transition-all duration-300 font-bold rounded-xl shadow-lg hover:shadow-xl"
              >
                <EyeIcon className="w-5 h-5" />
                <span>Ver Detalles</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal de imagen */}
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          alt={arreglo.nombre}
          arreglo={arreglo}
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}

