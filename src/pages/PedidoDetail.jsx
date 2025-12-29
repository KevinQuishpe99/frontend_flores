import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedidoById, updatePedido } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUrl';
import { formatearTelefono } from '../utils/phoneUtils';
import toast from 'react-hot-toast';
import Accordion from '../components/Accordion';
import ImageModal from '../components/ImageModal';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PhoneIcon,
  PlusIcon,
  PhotoIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'yellow', icon: ClockIcon },
  TRANSFERENCIA_VERIFICADA: { label: 'Transferencia Verificada', color: 'blue', icon: CheckCircleIcon },
  ASIGNADO: { label: 'Asignado', color: 'indigo', icon: UserPlusIcon },
  EN_PROCESO: { label: 'En Proceso', color: 'purple', icon: ClockIcon },
  COMPLETADO: { label: 'Completado', color: 'green', icon: CheckCircleIcon },
  CANCELADO: { label: 'Cancelado', color: 'red', icon: XCircleIcon },
};

export default function PedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAgregarExtras, setShowAgregarExtras] = useState(false);
  const [extras, setExtras] = useState('');
  const [comprobanteExtras, setComprobanteExtras] = useState(null);
  const [notasCliente, setNotasCliente] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedidoById(id),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePedido(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pedido', id]);
      queryClient.invalidateQueries(['pedidos']);
      toast.success('Pedido actualizado');
      setShowAgregarExtras(false);
      setExtras('');
      setComprobanteExtras(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar pedido');
    },
  });

  const handleAgregarExtras = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('extras', extras);
    formData.append('notasCliente', notasCliente);
    if (comprobanteExtras) {
      formData.append('comprobanteExtras', comprobanteExtras);
    }

    updateMutation.mutate({ id, data: formData });
  };

  const contactarWhatsApp = (telefono) => {
    if (!telefono) {
      toast.error('No hay teléfono disponible');
      return;
    }
    
    let numeroLimpio = telefono.replace(/[^0-9+]/g, '');
    if (!numeroLimpio.startsWith('+')) {
      if (numeroLimpio.length > 10) {
        numeroLimpio = '+' + numeroLimpio;
      } else {
        numeroLimpio = '+57' + numeroLimpio;
      }
    }
    
    const url = `https://wa.me/${numeroLimpio}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!pedido) {
    return <div className="text-center py-12">Pedido no encontrado</div>;
  }

  const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.PENDIENTE;
  const EstadoIcon = estadoInfo.icon;
  const esCliente = user?.rol === 'CLIENTE' && pedido.clienteId === user.id;
  const puedeContactar = (user?.rol === 'GERENTE' || user?.rol === 'EMPLEADO' || user?.rol === 'ADMIN') && pedido.cliente.telefono;

  const estadosOrden = ['PENDIENTE', 'TRANSFERENCIA_VERIFICADA', 'ASIGNADO', 'EN_PROCESO', 'COMPLETADO'];
  const estadoActualIndex = estadosOrden.indexOf(pedido.estado);
  const historial = pedido.historialEstado || [];

  // Verificar si el empleado puede actualizar el estado
  const puedeActualizarEstado = (user?.rol === 'EMPLEADO' && pedido.empleadoId === user.id) || 
                                 user?.rol === 'GERENTE' || 
                                 user?.rol === 'ADMIN';

  const handleCambiarEstado = (nuevoEstado) => {
    if (!puedeActualizarEstado) {
      toast.error('No tienes permiso para actualizar este pedido');
      return;
    }

    updateMutation.mutate({ 
      id, 
      data: { estado: nuevoEstado } 
    });
  };

  // Estados siguientes permitidos para el empleado
  const getSiguienteEstado = () => {
    if (pedido.estado === 'ASIGNADO') return 'EN_PROCESO';
    if (pedido.estado === 'EN_PROCESO') return 'COMPLETADO';
    return null;
  };

  const siguienteEstado = getSiguienteEstado();

  // Determinar la ruta de regreso según el rol
  const getRutaRegreso = () => {
    if (user?.rol === 'EMPLEADO') return '/empleado/pedidos';
    if (user?.rol === 'GERENTE') return '/gerente/pedidos';
    if (user?.rol === 'ADMIN') return '/admin/pedidos';
    if (user?.rol === 'CLIENTE') return '/mis-pedidos';
    return '/';
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      {/* Botón de Regreso */}
      <button
        onClick={() => navigate(getRutaRegreso())}
        className="mb-3 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Volver a la lista de pedidos</span>
      </button>

      {/* Header Compacto */}
      <div className="card mb-3 sm:mb-4 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 sm:p-3 rounded-lg bg-${estadoInfo.color}-500`}>
              <EstadoIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Pedido #{pedido.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-block px-2 py-1 rounded-md bg-${estadoInfo.color}-600 text-white font-semibold text-xs`}>
                  {estadoInfo.label}
                </span>
                {pedido.prioridad > 0 && (
                  <span className="inline-block px-2 py-1 rounded-md bg-red-100 text-red-700 font-semibold text-xs">
                    ⚡ Prioridad
                  </span>
                )}
              </div>
            </div>
          </div>
          {puedeContactar && (
            <button
              onClick={() => contactarWhatsApp(pedido.cliente.telefono)}
              className="btn-primary flex items-center gap-2 text-sm px-3 py-2"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Contactar</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Compacto */}
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Información Básica - Siempre Visible */}
          <div className="card p-3 sm:p-4">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Fecha de Entrega</p>
                <p className="font-semibold text-sm">
                  {new Date(pedido.horaEntrega).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-primary-600 font-medium text-sm">
                  {new Date(pedido.horaEntrega).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className="font-bold text-xl text-primary-600">
                  ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                </p>
                {pedido.extras > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    + ${pedido.extras.toLocaleString()} extras
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Arreglo - Compacto */}
          {pedido.arreglo && (
            <Accordion 
              title="Arreglo Solicitado" 
              icon={<PhotoIcon className="w-4 h-4" />}
              defaultOpen={true}
            >
              <div className="flex gap-3">
                <img
                  src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 100, height: 100 })}
                  alt={pedido.arreglo.nombre}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity border-2 border-primary-200"
                  onClick={() => setSelectedImage(getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen))}
                  title="Click para ver imagen completa"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-1">{pedido.arreglo.nombre}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2">{pedido.arreglo.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-primary-600 font-bold text-lg">
                      ${pedido.precioArreglo.toLocaleString()}
                    </p>
                    {pedido.arreglo.tipo && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {pedido.arreglo.tipo.nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Accordion>
          )}

          {/* Progreso - Acordeón */}
          <Accordion 
            title="Progreso del Pedido" 
            icon={<ClockIcon className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-4">
                {estadosOrden.map((estado, index) => {
                  const estadoTimeline = ESTADOS[estado];
                  const IconTimeline = estadoTimeline.icon;
                  const estaCompletado = index <= estadoActualIndex;
                  const esActual = index === estadoActualIndex;
                  const entradaHistorial = historial.find(h => h.estado === estado);
                  const esSiguienteEstado = siguienteEstado === estado && puedeActualizarEstado;

                  return (
                    <div key={estado} className="relative flex items-start gap-3">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                        estaCompletado ? `bg-${estadoTimeline.color}-600` : 'bg-gray-300'
                      } ${esActual ? 'ring-2 ring-primary-300' : ''}`}>
                        <IconTimeline className={`w-4 h-4 ${
                          estaCompletado ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${
                              estaCompletado ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {estadoTimeline.label}
                            </div>
                            {entradaHistorial && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(entradaHistorial.fecha).toLocaleString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {entradaHistorial.usuario && (
                                  <span className="ml-2 text-primary-600">por {entradaHistorial.usuario}</span>
                                )}
                              </div>
                            )}
                            {esActual && (
                              <div className="text-xs text-primary-600 font-medium mt-1 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></div>
                                Estado actual
                              </div>
                            )}
                          </div>
                          {/* Botón para avanzar al siguiente estado */}
                          {esSiguienteEstado && (
                            <button
                              onClick={() => handleCambiarEstado(estado)}
                              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? (
                                <>
                                  <ClockIcon className="w-3 h-3 animate-spin" />
                                  Actualizando...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-3 h-3" />
                                  Marcar como {estadoTimeline.label}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Mensaje informativo para empleados */}
            {puedeActualizarEstado && siguienteEstado && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-xs text-blue-800 font-medium">
                  💡 Puedes actualizar el estado del pedido usando el botón arriba
                </p>
              </div>
            )}
          </Accordion>

          {/* Información del Cliente - Acordeón */}
          {(user?.rol === 'EMPLEADO' || user?.rol === 'GERENTE' || user?.rol === 'ADMIN') && (
            <Accordion 
              title="Información del Cliente" 
              icon={<UserPlusIcon className="w-4 h-4" />}
              defaultOpen={true}
            >
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nombre</p>
                  <p className="font-semibold text-gray-900">
                    {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </p>
                </div>
                {pedido.cliente.telefono && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Teléfono</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-gray-900 flex-1">
                        {formatearTelefono(pedido.cliente.telefono)}
                      </span>
                      <button
                        onClick={() => contactarWhatsApp(pedido.cliente.telefono)}
                        className="btn-primary text-xs px-2 py-1.5 flex items-center gap-1"
                      >
                        <PhoneIcon className="w-3 h-3" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Accordion>
          )}

          {/* Imagen de Referencia - Acordeón */}
          {pedido.imagenReferencia && (
            <Accordion 
              title="Imagen de Referencia" 
              icon={<PhotoIcon className="w-4 h-4" />}
            >
              <div className="bg-gray-50 rounded-lg p-2">
                <img
                  src={getImageUrl(pedido.imagenReferencia)}
                  alt="Referencia"
                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(getImageUrl(pedido.imagenReferencia))}
                />
                <p className="text-xs text-gray-500 text-center mt-1">Click para ver imagen completa</p>
              </div>
            </Accordion>
          )}

          {/* Comprobante de Pago - Acordeón */}
          {pedido.comprobantePago && (
            <Accordion 
              title="Comprobante de Pago" 
              icon={<DocumentTextIcon className="w-4 h-4" />}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {pedido.transferenciaVerificada ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      <CheckCircleIcon className="w-3 h-3" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      <ClockIcon className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                  {pedido.verificadaPorNombre && (
                    <span className="text-xs text-gray-500">
                      por {pedido.verificadaPorNombre}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-2 flex justify-center">
                  <img
                    src={getImageUrl(pedido.comprobantePago)}
                    alt="Comprobante"
                    className="max-w-[180px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(getImageUrl(pedido.comprobantePago))}
                  />
                </div>
              </div>
            </Accordion>
          )}

          {/* Comprobantes de Extras - Acordeón */}
          {pedido.comprobantesExtras && pedido.comprobantesExtras.length > 0 && (
            <Accordion 
              title="Comprobantes de Extras" 
              icon={<PhotoIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pedido.comprobantesExtras.map((url, index) => (
                  <img
                    key={index}
                    src={getImageUrl(url)}
                    alt={`Comprobante ${index + 1}`}
                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(getImageUrl(url))}
                  />
                ))}
              </div>
            </Accordion>
          )}

          {/* Notas - Acordeón */}
          {(pedido.notas || pedido.notasCliente) && (
            <Accordion 
              title="Notas" 
              icon={<DocumentTextIcon className="w-4 h-4" />}
            >
              <div className="space-y-3">
                {pedido.notas && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Notas del sistema:</p>
                    <p className="text-sm text-gray-800">{pedido.notas}</p>
                  </div>
                )}
                {pedido.notasCliente && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                    <p className="text-xs font-semibold text-green-700 mb-1">Notas del cliente:</p>
                    <p className="text-sm text-gray-800">{pedido.notasCliente}</p>
                  </div>
                )}
              </div>
            </Accordion>
          )}

          {/* Agregar Extras (Solo Cliente) */}
          {esCliente && pedido.estado !== 'COMPLETADO' && pedido.estado !== 'CANCELADO' && (
            <Accordion 
              title="Agregar Extras" 
              icon={<PlusIcon className="w-4 h-4" />}
            >
              <form onSubmit={handleAgregarExtras} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valor de Extras ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={extras}
                    onChange={(e) => setExtras(e.target.value)}
                    className="input w-full text-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Comprobante de Pago
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setComprobanteExtras(e.target.files[0])}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={notasCliente}
                    onChange={(e) => setNotasCliente(e.target.value)}
                    className="input w-full text-sm"
                    rows="3"
                    placeholder="Describe qué extras deseas..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-sm py-2"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Agregando...' : 'Agregar Extras'}
                </button>
              </form>
            </Accordion>
          )}
        </div>

        {/* Sidebar Compacto */}
        <div className="space-y-3 sm:space-y-4">
          {/* Resumen de Información */}
          <div className="card p-3 sm:p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-primary-600" />
              Resumen
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Acordado:</span>
                <span className="font-semibold">${pedido.valorAcordado.toLocaleString()}</span>
              </div>
              {pedido.extras > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Extras:</span>
                  <span className="font-semibold">+ ${pedido.extras.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary-600">
                  ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Estado de Pago</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                  pedido.transferenciaVerificada 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {pedido.transferenciaVerificada ? (
                    <>
                      <CheckCircleIcon className="w-3 h-3" />
                      Verificado
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-3 h-3" />
                      Pendiente
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Empleado Asignado - Solo Gerente/Admin */}
          {pedido.empleado && (user?.rol === 'GERENTE' || user?.rol === 'ADMIN') && (
            <div className="card p-3 sm:p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <UserPlusIcon className="w-4 h-4 text-green-600" />
                Empleado Asignado
              </h3>
              <p className="text-sm font-medium text-gray-900">
                {pedido.empleado.nombre} {pedido.empleado.apellido}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imagen */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt="Imagen del pedido"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
