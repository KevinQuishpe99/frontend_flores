import { useQuery } from '@tanstack/react-query';
import { getPedidos } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
  TRANSFERENCIA_VERIFICADA: { label: 'Transferencia Verificada', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircleIcon },
  ASIGNADO: { label: 'Asignado', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: ClockIcon },
  EN_PROCESO: { label: 'En Proceso', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', icon: ClockIcon },
  COMPLETADO: { label: 'Completado', color: 'green', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
  CANCELADO: { label: 'Cancelado', color: 'red', bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
};

export default function MisPedidos() {
  const { user } = useAuthStore();

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', user?.id],
    queryFn: () => getPedidos(),
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
          <Link to="/catalogo" className="btn-primary inline-block">
            Ver Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pedidos.map((pedido) => {
            const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.PENDIENTE;
            const EstadoIcon = estadoInfo.icon;
            
            return (
              <Link
                key={pedido.id}
                to={`/pedido/${pedido.id}`}
                className="card block hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <EstadoIcon className={`w-5 h-5 sm:w-6 sm:h-6 text-${estadoInfo.color}-600`} />
                      <span className={`px-2 py-1 rounded text-xs sm:text-sm font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                        {estadoInfo.label}
                      </span>
                      {pedido.extras > 0 && (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          + ${pedido.extras.toLocaleString()} extras
                        </span>
                      )}
                    </div>
                    
                    {pedido.arreglo && (
                      <div className="flex gap-3 sm:gap-4 mb-3">
                        <img
                          src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 100, height: 100 })}
                          alt={pedido.arreglo.nombre}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base mb-1 truncate">{pedido.arreglo.nombre}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Entrega: {new Date(pedido.horaEntrega).toLocaleString('es-ES')}
                          </p>
                          {pedido.empleado && (
                            <p className="text-xs text-gray-500 mt-1">
                              Preparado por: {pedido.empleado.nombre} {pedido.empleado.apellido}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg sm:text-xl font-bold text-primary-600">
                        ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                      </p>
                      
                      {pedido.transferenciaVerificada ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          ✓ Transferencia Verificada
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          ⏳ Pendiente Verificación
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className="text-primary-600 text-sm font-medium">
                      Ver detalles →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

