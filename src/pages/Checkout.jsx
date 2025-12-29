import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createPedido } from '../api/pedidos';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Resumen del Carrito */}
        <div className="md:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.arregloId} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={getImageUrl(item.arreglo.imagenEditada || item.arreglo.imagen)}
                    alt={item.arreglo.nombre}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.arreglo.nombre}</h3>
                    <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    {item.notas && (
                      <p className="text-sm text-gray-500 italic">Notas: {item.notas}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      ${(item.arreglo.costo * item.cantidad).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Pedido */}
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="text-xl font-bold mb-4">Información del Pedido</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-5 h-5 inline mr-1" />
                Fecha y Hora de Entrega
              </label>
              <input
                type="datetime-local"
                value={horaEntrega}
                onChange={(e) => setHoraEntrega(e.target.value)}
                className="input w-full"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="w-5 h-5 inline mr-1" />
                Comprobante de Pago (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setComprobantePago(e.target.files[0])}
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes subir el comprobante después
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Generales (Opcional)
              </label>
              <textarea
                value={notasGenerales}
                onChange={(e) => setNotasGenerales(e.target.value)}
                className="input w-full"
                rows="3"
                placeholder="Instrucciones especiales para todos los pedidos..."
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn-primary w-full"
            >
              {createMutation.isLoading ? 'Procesando...' : `Confirmar ${items.length} Pedido(s)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

