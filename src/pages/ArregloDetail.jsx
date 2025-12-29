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
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!arreglo) {
    return <div className="text-center py-12">Arreglo no encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={imagenPrincipal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={getImageUrl(todasLasImagenes[imagenPrincipal])}
                alt={arreglo.nombre}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  console.error('Error al cargar imagen:', todasLasImagenes[imagenPrincipal]);
                  e.target.style.display = 'none';
                }}
              />
            </AnimatePresence>
            {todasLasImagenes.length > 1 && (
              <>
                <button
                  onClick={() => setImagenPrincipal((prev) => (prev > 0 ? prev - 1 : todasLasImagenes.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setImagenPrincipal((prev) => (prev < todasLasImagenes.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={toggleFavorito}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
              >
                {favoritos.includes(arreglo.id) ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <button
                onClick={compartir}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
              >
                <ShareIcon className="w-6 h-6 text-gray-700" />
              </button>
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
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm mb-3">
                {arreglo.tipo.nombre}
              </span>
            )}
            <h1 className="text-4xl font-bold mb-4">{arreglo.nombre}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{arreglo.descripcion}</p>
            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-4xl font-bold text-primary-600">
                ${arreglo.costo.toLocaleString()}
              </p>
            </div>
          </div>
          
          {isAuthenticated && user?.rol === 'CLIENTE' && (
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center text-lg py-3"
              >
                <ShoppingCartIcon className="w-6 h-6 mr-2" />
                Agregar al Carrito
              </button>
              <button
                onClick={() => setShowPedidoForm(true)}
                className="flex-1 btn-secondary flex items-center justify-center text-lg py-3"
              >
                <ShoppingBagIcon className="w-6 h-6 mr-2" />
                Pedido Directo
              </button>
            </div>
          )}

          {/* Información adicional */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold mb-3">Información del Producto</h3>
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
          </div>
        </div>
      </motion.div>

      {showPedidoForm && (
        <div className="mt-8 card">
          <h2 className="text-2xl font-bold mb-4">Realizar Pedido</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante de Transferencia
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setComprobantePago(e.target.files[0])}
                className="input"
                required
              />
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

            <div className="flex gap-4">
              <button type="submit" className="btn-primary flex-1">
                Confirmar Pedido
              </button>
              <button
                type="button"
                onClick={() => setShowPedidoForm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

