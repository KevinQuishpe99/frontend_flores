import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedidosPendientes, updatePedido } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function FloristaPedidos() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-pendientes'],
    queryFn: getPedidosPendientes,
    enabled: user?.rol === 'FLORISTA',
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePedido(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos-pendientes']);
      queryClient.invalidateQueries(['pedidos']);
      toast.success('Pedido actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar pedido');
    },
  });

  const handleVerificarTransferencia = (pedidoId, verificado) => {
    updatePedidoMutation.mutate({
      id: pedidoId,
      data: { transferenciaVerificada: verificado },
    });
  };

  const handleCambiarEstado = (pedidoId, nuevoEstado) => {
    updatePedidoMutation.mutate({
      id: pedidoId,
      data: { estado: nuevoEstado },
    });
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Pedidos Pendientes</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay pedidos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">Pedido #{pedido.id.slice(0, 8)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.estado === 'TRANSFERENCIA_VERIFICADA' ? 'bg-blue-100 text-blue-800' :
                      pedido.estado === 'EN_PROCESO' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      <strong>Cliente:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Teléfono:</strong> {pedido.cliente.telefono || 'No proporcionado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Entrega:</strong> {new Date(pedido.horaEntrega).toLocaleString('es-ES')}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      ${pedido.valorAcordado.toLocaleString()}
                    </p>
                  </div>

                  {pedido.arreglo && (
                    <div className="flex gap-2 mb-2">
                      <img
                        src={pedido.arreglo.imagenEditada || pedido.arreglo.imagen}
                        alt={pedido.arreglo.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">{pedido.arreglo.nombre}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {pedido.comprobantePago ? (
                      <>
                        <span className="text-sm text-gray-600">Transferencia:</span>
                        {pedido.transferenciaVerificada ? (
                          <span className="text-green-600 font-semibold text-sm">✓ Verificada</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold text-sm">Pendiente</span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600 text-sm">Sin comprobante</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to={`/pedido/${pedido.id}`}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Ver Detalles
                  </Link>

                  {!pedido.transferenciaVerificada && pedido.comprobantePago && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerificarTransferencia(pedido.id, true)}
                        className="btn-primary flex-1 flex items-center justify-center text-sm"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Verificar
                      </button>
                      <button
                        onClick={() => handleVerificarTransferencia(pedido.id, false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {pedido.transferenciaVerificada && pedido.estado === 'TRANSFERENCIA_VERIFICADA' && (
                    <button
                      onClick={() => handleCambiarEstado(pedido.id, 'EN_PROCESO')}
                      className="btn-primary text-sm"
                    >
                      Iniciar Proceso
                    </button>
                  )}

                  {pedido.estado === 'EN_PROCESO' && (
                    <button
                      onClick={() => handleCambiarEstado(pedido.id, 'COMPLETADO')}
                      className="btn-primary text-sm"
                    >
                      Marcar Completado
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

