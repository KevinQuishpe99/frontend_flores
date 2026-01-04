import { useQuery } from '@tanstack/react-query';
import { getPedidos } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { motion } from 'framer-motion';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Mis Pedidos
        </h1>
        <p className="text-gray-600 text-lg">Gestiona y sigue el estado de tus pedidos</p>
      </motion.div>

      {pedidos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <ClockIcon className="w-12 h-12 text-primary-500" />
          </div>
          <p className="text-gray-700 text-xl font-bold mb-2">No tienes pedidos aún</p>
          <p className="text-gray-500 mb-6">Comienza a crear pedidos desde nuestro catálogo</p>
          <Link 
            to="/catalogo" 
            className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Explorar Catálogo
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido, index) => {
            const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.PENDIENTE;
            const EstadoIcon = estadoInfo.icon;
            
            return (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Link
                  to={`/pedido/${pedido.id}`}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <div className={`p-2.5 rounded-xl bg-${estadoInfo.color}-100`}>
                            <EstadoIcon className={`w-6 h-6 text-${estadoInfo.color}-600`} />
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${estadoInfo.bg} ${estadoInfo.text} shadow-sm`}>
                            {estadoInfo.label}
                          </span>
                          {pedido.extras > 0 && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                              + ${pedido.extras.toLocaleString()} extras
                            </span>
                          )}
                        </div>
                        
                        {pedido.arreglo && (
                          <div className="flex gap-4 mb-4">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all">
                              <img
                                src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 100, height: 100 })}
                                alt={pedido.arreglo.nombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg sm:text-xl mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">
                                {pedido.arreglo.nombre}
                              </h3>
                              <p className="text-gray-600 text-sm mb-1">
                                📅 {new Date(pedido.horaEntrega).toLocaleString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {pedido.empleado && (
                                <p className="text-xs text-gray-500 font-medium">
                                  👤 Preparado por: {pedido.empleado.nombre} {pedido.empleado.apellido}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
                            <p className="text-2xl sm:text-3xl font-black text-primary-600">
                              ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                            </p>
                          </div>
                          
                          {pedido.transferenciaVerificada ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs font-bold rounded-full shadow-sm">
                              <CheckCircleIcon className="w-4 h-4" />
                              Transferencia Verificada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-xs font-bold rounded-full shadow-sm">
                              <ClockIcon className="w-4 h-4" />
                              Pendiente Verificación
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center justify-center sm:justify-end">
                        <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                          <ArrowRightIcon className="w-6 h-6 text-primary-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

