import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStock, venderStock } from '../api/stock';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';

const METODOS_PAGO = {
  EFECTIVO: { label: 'Efectivo', icon: BanknotesIcon, color: 'green' },
  TRANSFERENCIA: { label: 'Transferencia', icon: CreditCardIcon, color: 'blue' },
  TARJETA: { label: 'Tarjeta', icon: CreditCardIcon, color: 'purple' },
};

export default function EmpleadoStock() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showVenderModal, setShowVenderModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    metodoPago: 'EFECTIVO',
    comprobantePago: null,
    notas: '',
  });

  const { data: stock = [], isLoading } = useQuery({
    queryKey: ['stock-empleado'],
    queryFn: () => getStock({ estado: 'DISPONIBLE' }),
    enabled: user?.rol === 'EMPLEADO' || user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  const venderMutation = useMutation({
    mutationFn: ({ id, data }) => venderStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-empleado']);
      queryClient.invalidateQueries(['stock']);
      queryClient.invalidateQueries(['stock-stats']);
      toast.success('Venta registrada exitosamente');
      setShowVenderModal(false);
      setSelectedStock(null);
      setFormData({ metodoPago: 'EFECTIVO', comprobantePago: null, notas: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al registrar venta');
    },
  });

  const handleVender = (item) => {
    setSelectedStock(item);
    setFormData({ metodoPago: 'EFECTIVO', comprobantePago: null, notas: '' });
    setShowVenderModal(true);
  };

  const handleSubmitVenta = (e) => {
    e.preventDefault();
    
    if (formData.metodoPago === 'TRANSFERENCIA' && !formData.comprobantePago) {
      toast.error('Debes subir un comprobante de transferencia');
      return;
    }

    venderMutation.mutate({
      id: selectedStock.id,
      data: formData,
    });
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Stock Disponible</h1>
        <p className="text-gray-600 text-sm sm:text-base">Arreglos disponibles para venta en el local</p>
      </div>

      {stock.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay artículos disponibles en stock</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stock.map((item) => (
            <div key={item.id} className="card">
              <div className="flex gap-3 mb-3">
                <img
                  src={getImageUrl(item.arreglo.imagenEditada || item.arreglo.imagen, { width: 100, height: 100 })}
                  alt={item.arreglo.nombre}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{item.arreglo.nombre}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.arreglo.descripcion}</p>
                  <p className="text-primary-600 font-bold mt-1 text-lg">
                    ${item.precioVenta.toLocaleString()}
                  </p>
                </div>
              </div>

              {item.notas && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.notas}</p>
              )}

              <button
                onClick={() => handleVender(item)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                Registrar Venta
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Vender */}
      {showVenderModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Arreglo:</p>
              <p className="font-semibold">{selectedStock.arreglo.nombre}</p>
              <p className="text-primary-600 font-bold text-lg mt-1">
                ${selectedStock.precioVenta.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleSubmitVenta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <div className="space-y-2">
                  {Object.entries(METODOS_PAGO).map(([key, metodo]) => {
                    const Icon = metodo.icon;
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.metodoPago === key
                            ? `border-${metodo.color}-600 bg-${metodo.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodoPago"
                          value={key}
                          checked={formData.metodoPago === key}
                          onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value, comprobantePago: null })}
                          className="sr-only"
                        />
                        <Icon className={`w-5 h-5 text-${metodo.color}-600`} />
                        <span className="font-medium">{metodo.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {formData.metodoPago === 'TRANSFERENCIA' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Transferencia *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, comprobantePago: e.target.files[0] })}
                    className="input w-full"
                    required={formData.metodoPago === 'TRANSFERENCIA'}
                  />
                  {formData.comprobantePago && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Archivo seleccionado: {formData.comprobantePago.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="input w-full"
                  rows="3"
                  placeholder="Notas adicionales sobre la venta..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={venderMutation.isPending}
                >
                  {venderMutation.isPending ? 'Registrando...' : 'Confirmar Venta'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVenderModal(false);
                    setSelectedStock(null);
                    setFormData({ metodoPago: 'EFECTIVO', comprobantePago: null, notas: '' });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

