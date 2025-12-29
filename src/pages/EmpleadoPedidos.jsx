import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedidos, updatePedido } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { formatearTelefono } from '../utils/phoneUtils';
import ImageModal from '../components/ImageModal';

const ESTADOS = {
  ASIGNADO: { label: 'Asignado', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  EN_PROCESO: { label: 'En Proceso', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' },
  COMPLETADO: { label: 'Completado', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function EmpleadoPedidos() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-empleado', user?.id],
    queryFn: () => getPedidos(),
    enabled: user?.rol === 'EMPLEADO',
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePedido(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos-empleado']);
      queryClient.invalidateQueries(['pedidos']);
      toast.success('Pedido actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar pedido');
    },
  });

  const handleCambiarEstado = (pedidoId, nuevoEstado) => {
    updatePedidoMutation.mutate({
      id: pedidoId,
      data: { estado: nuevoEstado },
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

  // Filtrar solo pedidos asignados al empleado
  const misPedidos = pedidos.filter(p => p.empleadoId === user?.id);
  
  // Ordenar por prioridad y fecha de entrega
  const pedidosOrdenados = [...misPedidos].sort((a, b) => {
    const prioridadA = a.prioridad || 0;
    const prioridadB = b.prioridad || 0;
    if (prioridadA !== prioridadB) {
      return prioridadB - prioridadA;
    }
    return new Date(a.horaEntrega) - new Date(b.horaEntrega);
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Mis Pedidos Asignados</h1>
        <p className="text-gray-600 text-xs sm:text-sm">Gestiona los pedidos que te han sido asignados</p>
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes pedidos asignados</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {pedidosOrdenados.map((pedido) => {
            const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.ASIGNADO;
            const fechaEntrega = new Date(pedido.horaEntrega);
            const ahora = new Date();
            const horasRestantes = Math.floor((fechaEntrega - ahora) / (1000 * 60 * 60));
            const esUrgente = horasRestantes < 24 && horasRestantes > 0;
            const esMuyUrgente = horasRestantes < 2 && horasRestantes > 0;
            
            return (
              <div 
                key={pedido.id} 
                className={`card p-3 sm:p-4 ${esMuyUrgente ? 'border-l-4 border-red-500' : esUrgente ? 'border-l-4 border-orange-500' : ''}`}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header Compacto */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        #{pedido.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                        {estadoInfo.label}
                      </span>
                      {pedido.prioridad > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                          ⚡ {pedido.prioridad}
                        </span>
                      )}
                      {esMuyUrgente && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
                          ⚠️ Urgente
                        </span>
                      )}
                      {esUrgente && !esMuyUrgente && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                          ⏰ {horasRestantes}h
                        </span>
                      )}
                    </div>

                    {/* Información Compacta */}
                    <div className="grid sm:grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-xs text-gray-600">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">
                          {pedido.cliente.nombre} {pedido.cliente.apellido}
                        </p>
                        {pedido.cliente.telefono && (
                          <button
                            onClick={() => contactarWhatsApp(pedido.cliente.telefono)}
                            className="btn-primary text-xs px-2 py-1 mt-1 flex items-center gap-1"
                          >
                            <PhoneIcon className="w-3 h-3" />
                            WhatsApp
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Entrega</p>
                        <p className="text-sm font-medium">
                          {fechaEntrega.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {fechaEntrega.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Arreglo - Imagen Grande y Visible */}
                    {pedido.arreglo && (
                      <div className="mb-2">
                        <div className="flex gap-3 mb-2">
                          <img
                            src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 200, height: 200 })}
                            alt={pedido.arreglo.nombre}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity border-2 border-primary-200 shadow-md"
                            onClick={() => setSelectedImage(getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen))}
                            title="Click para ver imagen completa"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base mb-1">{pedido.arreglo.nombre}</p>
                            <p className="text-primary-600 font-bold text-base sm:text-lg">
                              ${pedido.valorAcordado.toLocaleString()}
                            </p>
                            {pedido.arreglo.descripcion && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {pedido.arreglo.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          💡 Click en la imagen para verla más grande
                        </p>
                      </div>
                    )}

                    {pedido.notas && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        📝 {pedido.notas}
                      </p>
                    )}
                  </div>

                  {/* Acciones Compactas */}
                  <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                    {/* Controles de Prioridad */}
                    <div className="flex gap-1 sm:flex-col">
                      <div className="text-xs text-gray-500 mb-1 hidden sm:block text-center">Prioridad</div>
                      <button
                        onClick={() => handleCambiarPrioridad(pedido.id, 'up')}
                        className="btn-secondary p-1.5 sm:w-full flex items-center justify-center gap-1"
                        title="Aumentar prioridad"
                        disabled={updatePedidoMutation.isPending}
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">↑</span>
                      </button>
                      <button
                        onClick={() => handleCambiarPrioridad(pedido.id, 'down')}
                        className="btn-secondary p-1.5 sm:w-full flex items-center justify-center gap-1"
                        title="Disminuir prioridad"
                        disabled={updatePedidoMutation.isPending}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">↓</span>
                      </button>
                    </div>
                    
                    <Link
                      to={`/pedido/${pedido.id}`}
                      className="btn-secondary flex items-center justify-center text-xs sm:text-sm px-2 py-1.5 sm:w-full"
                    >
                      <EyeIcon className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Ver</span>
                    </Link>

                    {pedido.estado === 'ASIGNADO' && (
                      <button
                        onClick={() => handleCambiarEstado(pedido.id, 'EN_PROCESO')}
                        className="btn-primary flex items-center justify-center text-xs sm:text-sm px-2 py-1.5 sm:w-full"
                        disabled={updatePedidoMutation.isPending}
                      >
                        <ClockIcon className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Iniciar</span>
                      </button>
                    )}

                    {pedido.estado === 'EN_PROCESO' && (
                      <button
                        onClick={() => handleCambiarEstado(pedido.id, 'COMPLETADO')}
                        className="btn-primary flex items-center justify-center text-xs sm:text-sm px-2 py-1.5 sm:w-full"
                        disabled={updatePedidoMutation.isPending}
                      >
                        <CheckCircleIcon className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Completar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Imagen */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt="Arreglo"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

