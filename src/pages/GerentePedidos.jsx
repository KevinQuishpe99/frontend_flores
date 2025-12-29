import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedidosPendientes, updatePedido, getPedidos } from '../api/pedidos';
import { getEmpleados } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  UserPlusIcon,
  PhoneIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { formatearTelefono } from '../utils/phoneUtils';

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  TRANSFERENCIA_VERIFICADA: { label: 'Transferencia Verificada', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
  ASIGNADO: { label: 'Asignado', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  EN_PROCESO: { label: 'En Proceso', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' },
  COMPLETADO: { label: 'Completado', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function GerentePedidos() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-gerente'],
    queryFn: () => getPedidos(),
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });
  
  // Admin puede ver todos los pedidos, gerente también
  const esAdmin = user?.rol === 'ADMIN';

  const { data: empleados = [] } = useQuery({
    queryKey: ['empleados'],
    queryFn: getEmpleados,
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePedido(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos-gerente']);
      queryClient.invalidateQueries(['pedidos']);
      queryClient.invalidateQueries(['notificaciones']);
      toast.success('Pedido actualizado');
      setShowAsignarModal(false);
      setSelectedPedido(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar pedido');
    },
  });

  const handleVerificarTransferencia = (pedidoId, verificado) => {
    updatePedidoMutation.mutate({
      id: pedidoId,
      data: { transferenciaVerificada: verificado },
    });
  };

  const handleAsignarEmpleado = (pedido) => {
    setSelectedPedido(pedido);
    setEmpleadoSeleccionado(pedido.empleadoId || '');
    setShowAsignarModal(true);
  };

  const handleConfirmarAsignacion = () => {
    if (!empleadoSeleccionado) {
      toast.error('Selecciona un empleado');
      return;
    }

    updatePedidoMutation.mutate({
      id: selectedPedido.id,
      data: { 
        empleadoId: empleadoSeleccionado,
        estado: 'ASIGNADO'
      },
    });
  };

  const handleCambiarPrioridad = (pedidoId, direccion) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    const nuevaPrioridad = (pedido.prioridad || 0) + (direccion === 'up' ? 1 : -1);
    updatePedidoMutation.mutate({
      id: pedidoId,
      data: { prioridad: nuevaPrioridad },
    });
  };

  const contactarWhatsApp = (telefono) => {
    if (!telefono) {
      toast.error('No hay teléfono disponible');
      return;
    }
    
    // Limpiar el número: quitar espacios, guiones, paréntesis, etc.
    let numeroLimpio = telefono.replace(/[^0-9+]/g, '');
    
    // Si no empieza con +, intentar detectar si tiene código de país
    if (!numeroLimpio.startsWith('+')) {
      // Si tiene más de 10 dígitos, probablemente ya incluye código de país
      if (numeroLimpio.length > 10) {
        numeroLimpio = '+' + numeroLimpio;
      } else {
        // Asumir código de país por defecto (puedes cambiarlo según tu país)
        numeroLimpio = '+57' + numeroLimpio; // Cambia esto según tu país
      }
    }
    
    // Abrir WhatsApp Web o App según el dispositivo
    const url = `https://wa.me/${numeroLimpio}`;
    window.open(url, '_blank');
  };

  // Ordenar pedidos por prioridad y fecha
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    const prioridadA = a.prioridad || 0;
    const prioridadB = b.prioridad || 0;
    if (prioridadA !== prioridadB) {
      return prioridadB - prioridadA; // Mayor prioridad primero
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {esAdmin ? 'Gestión de Pedidos (Admin)' : 'Gestión de Pedidos'}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {esAdmin ? 'Gestiona todos los pedidos, revisa transferencias y asigna empleados' : 'Revisa transferencias y asigna empleados'}
        </p>
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay pedidos</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pedidosOrdenados.map((pedido) => {
            const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.PENDIENTE;
            
            return (
              <div key={pedido.id} className="card">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="font-semibold text-sm sm:text-base">
                        Pedido #{pedido.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                        {estadoInfo.label}
                      </span>
                      {pedido.prioridad > 0 && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                          Prioridad: {pedido.prioridad}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <strong className="text-sm text-gray-700">👤 Cliente:</strong>
                          <span className="text-sm font-medium text-gray-900">
                            {pedido.cliente.nombre} {pedido.cliente.apellido}
                          </span>
                        </div>
                        {pedido.cliente.telefono && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 font-mono">
                              {formatearTelefono(pedido.cliente.telefono)}
                            </span>
                            <button
                              onClick={() => contactarWhatsApp(pedido.cliente.telefono)}
                              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 ml-auto"
                              title="Contactar cliente por WhatsApp"
                            >
                              <PhoneIcon className="w-4 h-4" />
                              WhatsApp
                            </button>
                          </div>
                        )}
                      </div>
                      {pedido.empleado && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <strong className="text-sm text-gray-700">👷 Empleado:</strong>
                            <span className="text-sm font-medium text-gray-900">
                              {pedido.empleado.nombre} {pedido.empleado.apellido}
                            </span>
                          </div>
                          {pedido.empleado.telefono && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 font-mono">
                                {formatearTelefono(pedido.empleado.telefono)}
                              </span>
                              <button
                                onClick={() => contactarWhatsApp(pedido.empleado.telefono)}
                                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 ml-auto"
                                title="Contactar empleado por WhatsApp"
                              >
                                <PhoneIcon className="w-4 h-4" />
                                WhatsApp
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Entrega: {new Date(pedido.horaEntrega).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-primary-600">
                          ${pedido.valorAcordado.toLocaleString()}
                        </span>
                        {pedido.extras > 0 && (
                          <span className="text-sm text-gray-600 ml-2">
                            (+ ${pedido.extras.toLocaleString()} extras)
                          </span>
                        )}
                      </div>
                    </div>

                    {pedido.arreglo && (
                      <div className="flex gap-3 mb-3">
                        <img
                          src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 80, height: 80 })}
                          alt={pedido.arreglo.nombre}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{pedido.arreglo.nombre}</p>
                          {pedido.empleado && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Asignado a: {pedido.empleado.nombre} {pedido.empleado.apellido}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {pedido.comprobantePago ? (
                        <>
                          <span className="text-gray-600">Transferencia:</span>
                          {pedido.transferenciaVerificada ? (
                            <span className="text-green-600 font-semibold">✓ Verificada</span>
                          ) : (
                            <span className="text-yellow-600 font-semibold">Pendiente</span>
                          )}
                        </>
                      ) : (
                        <span className="text-red-600">Sin comprobante</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCambiarPrioridad(pedido.id, 'up')}
                        className="flex-1 sm:flex-none btn-secondary p-2"
                        title="Aumentar prioridad"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCambiarPrioridad(pedido.id, 'down')}
                        className="flex-1 sm:flex-none btn-secondary p-2"
                        title="Disminuir prioridad"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Link
                      to={`/pedido/${pedido.id}`}
                      className="btn-secondary flex items-center justify-center text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Ver
                    </Link>

                    {!pedido.transferenciaVerificada && pedido.comprobantePago && (
                      <button
                        onClick={() => handleVerificarTransferencia(pedido.id, true)}
                        className="btn-primary flex items-center justify-center text-sm"
                        disabled={updatePedidoMutation.isPending}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Verificar
                      </button>
                    )}

                    {pedido.transferenciaVerificada && !pedido.empleadoId && (
                      <button
                        onClick={() => handleAsignarEmpleado(pedido)}
                        className="btn-primary flex items-center justify-center text-sm"
                      >
                        <UserPlusIcon className="w-4 h-4 mr-1" />
                        Asignar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para asignar empleado */}
      {showAsignarModal && selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Asignar Empleado</h2>
            <p className="text-gray-600 mb-4">
              Selecciona el empleado que preparará este arreglo
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado
              </label>
              <select
                value={empleadoSeleccionado}
                onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                className="input w-full"
              >
                <option value="">Selecciona un empleado</option>
                {empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombre} {empleado.apellido}
                  </option>
                ))}
                <option value={user.id}>Yo mismo (Gerente)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmarAsignacion}
                className="flex-1 btn-primary"
                disabled={updatePedidoMutation.isPending}
              >
                {updatePedidoMutation.isPending ? 'Asignando...' : 'Asignar'}
              </button>
              <button
                onClick={() => {
                  setShowAsignarModal(false);
                  setSelectedPedido(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

