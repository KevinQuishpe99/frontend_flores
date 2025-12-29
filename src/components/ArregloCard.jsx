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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
      >
        {/* Imagen clicable para ver más grande */}
        <div 
          className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={getImageUrl(arreglo.imagenEditada || arreglo.imagen, { width: 500, height: 500 })}
            alt={arreglo.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay oscuro en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300"></div>
          
          {/* Icono de zoom que aparece en hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <MagnifyingGlassIcon className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          {/* Badge de tipo */}
          {arreglo.tipo && (
            <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-semibold text-primary-700 shadow-lg border border-primary-200">
                <SparklesIcon className="w-3.5 h-3.5" />
                {arreglo.tipo.nombre}
              </span>
            </div>
          )}
          
          {/* Botón de favoritos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onToggleFavorito) {
                onToggleFavorito(arreglo.id, e);
              }
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-lg z-10 hover:scale-110"
            title={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {isFavorito ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {/* Precio destacado */}
          <div className="absolute bottom-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border-2 border-primary-200">
              <span className="text-primary-600 font-bold text-xl">
                ${arreglo.costo.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Contenido de la card */}
        <div className="p-5">
          <h3 
            className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-primary-600 transition-colors"
            onClick={() => handleCardClick(arreglo.id)}
          >
            {arreglo.nombre}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
            {arreglo.descripcion}
          </p>
          
          {/* Botones de Acción */}
          <div className="pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            {isAuthenticated && user?.rol === 'CLIENTE' ? (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(arreglo.id);
                  }}
                  className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Detalles</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors font-medium"
                  title="Agregar al carrito"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Carrito</span>
                </button>
                <button
                  onClick={handlePedidoRapido}
                  className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold"
                  title="Pedido rápido"
                >
                  <span>Pedir</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(arreglo.id);
                }}
                className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold"
              >
                <EyeIcon className="w-5 h-5" />
                <span>Ver Detalles</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
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

