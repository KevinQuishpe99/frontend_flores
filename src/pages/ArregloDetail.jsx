import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArregloById } from '../api/arreglos';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingBagIcon, ShoppingCartIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { createPedido } from '../api/pedidos';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';

export default function ArregloDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [horaEntrega, setHoraEntrega] = useState('');
  const [valorAcordado, setValorAcordado] = useState('');
  const [imagenReferencia, setImagenReferencia] = useState(null);
  const [comprobantePago, setComprobantePago] = useState(null);
  const [notas, setNotas] = useState('');
  const [imagenPrincipal, setImagenPrincipal] = useState(0);
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      toast.error('Debes iniciar sesión como cliente para agregar al carrito');
      navigate('/login');
      return;
    }
    
    if (arreglo) {
      addItem(arreglo);
      toast.success(`${arreglo.nombre} agregado al carrito`);
    }
  };

  const toggleFavorito = () => {
    if (!arreglo) return;
    const nuevosFavoritos = favoritos.includes(arreglo.id)
      ? favoritos.filter(favId => favId !== arreglo.id)
      : [...favoritos, arreglo.id];
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    toast.success(favoritos.includes(arreglo.id) ? 'Removido de favoritos' : 'Agregado a favoritos');
  };

  const { data: arreglo, isLoading } = useQuery({
    queryKey: ['arreglo', id],
    queryFn: () => getArregloById(id),
  });

  const todasLasImagenes = arreglo ? [
    arreglo.imagenEditada || arreglo.imagen,
    ...(arreglo.imagenesAdicionales || [])
  ].filter(Boolean) : [];

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: arreglo?.nombre,
          text: arreglo?.descripcion,
          url: window.location.href,
        });
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para hacer un pedido');
      navigate('/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('arregloId', id);
      formData.append('horaEntrega', horaEntrega);
      formData.append('valorAcordado', valorAcordado);
      formData.append('notas', notas);
      
      if (imagenReferencia) {
        formData.append('imagenReferencia', imagenReferencia);
      }
      if (comprobantePago) {
        formData.append('comprobantePago', comprobantePago);
      }

      await createPedido(formData);
      toast.success('Pedido creado exitosamente');
      navigate('/mis-pedidos');
    } catch (error) {
      toast.error('Error al crear pedido');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!arreglo) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Arreglo no encontrado</h2>
          <p className="text-gray-600 mb-6">El arreglo que buscas no existe o fue eliminado</p>
          <button
            onClick={() => navigate('/catalogo')}
            className="btn-primary"
          >
            Ver Catálogo
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid md:grid-cols-2 gap-8 lg:gap-12"
      >
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={imagenPrincipal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={getImageUrl(todasLasImagenes[imagenPrincipal])}
                alt={arreglo.nombre}
                className="w-full h-96 sm:h-[500px] lg:h-[600px] object-cover"
                onError={(e) => {
                  console.error('Error al cargar imagen:', todasLasImagenes[imagenPrincipal]);
                  e.target.style.display = 'none';
                }}
              />
            </AnimatePresence>
            {todasLasImagenes.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setImagenPrincipal((prev) => (prev > 0 ? prev - 1 : todasLasImagenes.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all shadow-xl border border-white/50 z-10"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setImagenPrincipal((prev) => (prev < todasLasImagenes.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all shadow-xl border border-white/50 z-10"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </>
            )}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorito}
                className="p-3 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-xl border border-white/50"
              >
                {favoritos.includes(arreglo.id) ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={compartir}
                className="p-3 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-xl border border-white/50"
              >
                <ShareIcon className="w-6 h-6 text-gray-700 hover:text-primary-600 transition-colors" />
              </motion.button>
            </div>
            {todasLasImagenes.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {todasLasImagenes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenPrincipal(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      imagenPrincipal === index ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Miniaturas */}
          {todasLasImagenes.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {todasLasImagenes.map((imagen, index) => (
                <button
                  key={index}
                  onClick={() => setImagenPrincipal(index)}
                  className={`relative overflow-hidden rounded-lg aspect-square ${
                    imagenPrincipal === index ? 'ring-2 ring-primary-600' : 'opacity-60 hover:opacity-100'
                  } transition-all`}
                >
                  <img
                    src={getImageUrl(imagen, { width: 150, height: 150 })}
                    alt={`${arreglo.nombre} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-6">
          <div>
            {arreglo.tipo && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-bold mb-4 shadow-lg"
              >
                {arreglo.tipo.nombre}
              </motion.span>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight"
            >
              {arreglo.nombre}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg sm:text-xl leading-relaxed mb-6"
            >
              {arreglo.descripcion}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-baseline gap-3 mb-8 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border-2 border-primary-200"
            >
              <span className="text-gray-500 font-bold text-xl">$</span>
              <p className="text-5xl sm:text-6xl font-black text-primary-600">
                {arreglo.costo.toLocaleString()}
              </p>
            </motion.div>
          </div>
          
          {isAuthenticated && user?.rol === 'CLIENTE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                Agregar al Carrito
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPedidoForm(true)}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingBagIcon className="w-6 h-6" />
                Pedido Directo
              </motion.button>
            </motion.div>
          )}

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <h3 className="font-black text-xl mb-4 text-gray-900">Información del Producto</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibilidad:</span>
                <span className={arreglo.disponible ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {arreglo.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              {arreglo.creador && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado por:</span>
                  <span className="font-semibold">
                    {arreglo.creador.nombre} {arreglo.creador.apellido}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {showPedidoForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Realizar Pedido</h2>
          </div>
          <form onSubmit={handleSubmitPedido} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Entrega
              </label>
              <input
                type="datetime-local"
                value={horaEntrega}
                onChange={(e) => setHoraEntrega(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Acordado
              </label>
              <input
                type="number"
                value={valorAcordado}
                onChange={(e) => setValorAcordado(e.target.value)}
                className="input"
                placeholder={arreglo.costo}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Referencia (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenReferencia(e.target.files[0])}
                className="input"
              />
            </div>

            <div>
              <ImageUpload
                label="Comprobante de Transferencia"
                onImageSelect={(file) => setComprobantePago(file)}
                required
              />
              {comprobantePago && (
                <p className="text-xs text-green-600 mt-1">✓ Archivo seleccionado</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="input"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Confirmar Pedido
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPedidoForm(false)}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}

