import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createPedido } from '../api/pedidos';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarIcon, CreditCardIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';
import { motion } from 'framer-motion';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const [horaEntrega, setHoraEntrega] = useState('');
  const [comprobantePago, setComprobantePago] = useState(null);
  const [notasGenerales, setNotasGenerales] = useState('');

  const total = getTotal();

  const createMutation = useMutation({
    mutationFn: createPedido,
    onSuccess: () => {
      toast.success('Pedidos creados exitosamente');
      clearCart();
      navigate('/mis-pedidos');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear pedidos');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      toast.error('Debes iniciar sesión como cliente');
      navigate('/login');
      return;
    }

    if (!horaEntrega) {
      toast.error('Debes seleccionar una fecha y hora de entrega');
      return;
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    // Crear un pedido por cada arreglo en el carrito
    try {
      const pedidos = items.map(async (item) => {
        const formData = new FormData();
        formData.append('arregloId', item.arregloId);
        formData.append('horaEntrega', horaEntrega);
        formData.append('valorAcordado', (item.arreglo.costo * item.cantidad).toString());
        formData.append('notas', item.notas || notasGenerales || '');
        
        if (comprobantePago) {
          formData.append('comprobantePago', comprobantePago);
        }

        return createPedido(formData);
      });

      await Promise.all(pedidos);
      toast.success(`${items.length} pedido(s) creado(s) exitosamente`);
      clearCart();
      navigate('/mis-pedidos');
    } catch (error) {
      toast.error('Error al crear pedidos');
      console.error(error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Carrito Vacío</h1>
        <p className="text-gray-600 mb-6">No tienes artículos en tu carrito</p>
        <button
          onClick={() => navigate('/catalogo')}
          className="btn-primary"
        >
          Ver Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Finalizar Pedido
        </h1>
        <p className="text-gray-600 text-lg">Revisa tu pedido y completa la información</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Resumen del Carrito */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Resumen del Pedido</h2>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.arregloId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all">
                    <img
                      src={getImageUrl(item.arreglo.imagenEditada || item.arreglo.imagen)}
                      alt={item.arreglo.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">
                      {item.arreglo.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Cantidad: <span className="font-bold text-primary-600">{item.cantidad}</span>
                    </p>
                    {item.notas && (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                        📝 {item.notas}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-primary-600">
                      ${(item.arreglo.costo * item.cantidad).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-50 to-white p-4 rounded-xl">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-3xl font-black text-primary-600">
                ${total.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Formulario de Pedido */}
        <div className="lg:col-span-1">
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-5 sticky top-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Información del Pedido</h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-600" />
                Fecha y Hora de Entrega
              </label>
              <input
                type="datetime-local"
                value={horaEntrega}
                onChange={(e) => setHoraEntrega(e.target.value)}
                className="input w-full border-2 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-xl py-3 font-medium"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary-600" />
                Comprobante de Pago (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setComprobantePago(e.target.files[0])}
                  className="hidden"
                  id="comprobante-upload"
                />
                <label
                  htmlFor="comprobante-upload"
                  className="cursor-pointer block"
                >
                  {comprobantePago ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CreditCardIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm text-green-600 font-bold">✓ Archivo seleccionado</p>
                      <p className="text-xs text-gray-500 font-medium">{comprobantePago.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setComprobantePago(null);
                          document.getElementById('comprobante-upload').value = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                        <CreditCardIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-700 font-semibold mb-1">Haz clic para seleccionar</p>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Notas Generales (Opcional)
              </label>
              <textarea
                value={notasGenerales}
                onChange={(e) => setNotasGenerales(e.target.value)}
                className="input w-full border-2 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-xl py-3 resize-none"
                rows="4"
                placeholder="Instrucciones especiales para todos los pedidos..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={createMutation.isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar {items.length} Pedido{items.length > 1 ? 's' : ''}
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

