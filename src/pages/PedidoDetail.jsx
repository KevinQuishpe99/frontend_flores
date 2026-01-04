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
import { motion } from 'framer-motion';
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
  ArrowLeftIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useTema } from '../components/TemaProvider';

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
  const { configuraciones } = useTema();
  const queryClient = useQueryClient();
  const [showAgregarExtras, setShowAgregarExtras] = useState(false);
  const [extras, setExtras] = useState('');
  const [comprobanteExtras, setComprobanteExtras] = useState(null);
  const [notasCliente, setNotasCliente] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Datos de la empresa desde configuraciones (vienen en formato simple: { clave: valor })
  const direccionEmpresa = configuraciones?.direccion_empresa || '';
  const whatsappEmpresa1 = configuraciones?.whatsapp_empresa_1 || '';
  const whatsappEmpresa2 = configuraciones?.whatsapp_empresa_2 || '';
  
  // Usar el primer WhatsApp si está disponible, sino el segundo
  const telefonoEmpresa = whatsappEmpresa1 || whatsappEmpresa2;

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

  const contactarWhatsApp = (telefono, mensaje = '') => {
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
    
    const mensajeEncoded = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
    const url = `https://wa.me/${numeroLimpio}${mensajeEncoded}`;
    window.open(url, '_blank');
  };

  const abrirGoogleMaps = (direccion) => {
    if (!direccion) {
      toast.error('No hay dirección disponible');
      return;
    }
    
    const direccionEncoded = encodeURIComponent(direccion);
    const url = `https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Botón de Regreso */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(getRutaRegreso())}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-all text-sm font-bold group"
      >
        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Volver a la lista de pedidos</span>
      </motion.button>

      {/* Header Moderno */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl mb-6 p-6 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br from-${estadoInfo.color}-500 to-${estadoInfo.color}-600 shadow-lg`}>
              <EstadoIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Pedido #{pedido.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-${estadoInfo.color}-500 to-${estadoInfo.color}-600 text-white font-bold text-sm shadow-md`}>
                  {estadoInfo.label}
                </span>
                {pedido.prioridad > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs shadow-md">
                    ⚡ Prioridad Alta
                  </span>
                )}
              </div>
            </div>
          </div>
          {(user?.rol === 'EMPLEADO' || user?.rol === 'GERENTE' || user?.rol === 'ADMIN') && pedido.cliente.telefono && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => contactarWhatsApp(pedido.cliente.telefono, `Hola ${pedido.cliente.nombre}, te contacto sobre tu pedido #${pedido.id.slice(0, 8)}`)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2 text-sm px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <PhoneIcon className="w-5 h-5" />
              <span className="hidden sm:inline">WhatsApp Cliente</span>
              <span className="sm:hidden">WhatsApp</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Grid Moderno */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica - Siempre Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Fecha de Entrega</p>
                <p className="font-bold text-lg text-gray-900 mb-1">
                  {new Date(pedido.horaEntrega).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-primary-600 font-black text-xl">
                  {new Date(pedido.horaEntrega).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Total</p>
                <p className="font-black text-3xl text-primary-600 mb-1">
                  ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                </p>
                {pedido.extras > 0 && (
                  <p className="text-sm text-green-600 font-bold">
                    + ${pedido.extras.toLocaleString()} extras
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Arreglo - Moderno */}
          {pedido.arreglo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Accordion 
                title="Arreglo Solicitado" 
                icon={<PhotoIcon className="w-5 h-5" />}
                defaultOpen={true}
              >
                <div className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden ring-4 ring-primary-100 cursor-pointer hover:ring-primary-300 transition-all group">
                    <img
                      src={getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen, { width: 150, height: 150 })}
                      alt={pedido.arreglo.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onClick={() => setSelectedImage(getImageUrl(pedido.arreglo.imagenEditada || pedido.arreglo.imagen))}
                      title="Click para ver imagen completa"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl sm:text-2xl mb-2 text-gray-900">{pedido.arreglo.nombre}</h3>
                    <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-3 leading-relaxed">{pedido.arreglo.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-primary-600 font-black text-2xl">
                        ${pedido.precioArreglo.toLocaleString()}
                      </p>
                      {pedido.arreglo.tipo && (
                        <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-xs font-bold shadow-md">
                          {pedido.arreglo.tipo.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Accordion>
            </motion.div>
          )}

          {/* Progreso - Timeline Moderno */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion 
              title="Progreso del Pedido" 
              icon={<ClockIcon className="w-5 h-5" />}
              defaultOpen={true}
            >
              <div className="relative pl-8">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-200 to-gray-200"></div>
                <div className="absolute left-6 top-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600" style={{ height: `${((estadoActualIndex + 1) / estadosOrden.length) * 100}%` }}></div>
                <div className="space-y-6">
                  {estadosOrden.map((estado, index) => {
                    const estadoTimeline = ESTADOS[estado];
                    const IconTimeline = estadoTimeline.icon;
                    const estaCompletado = index <= estadoActualIndex;
                    const esActual = index === estadoActualIndex;
                    const entradaHistorial = historial.find(h => h.estado === estado);
                    const esSiguienteEstado = siguienteEstado === estado && puedeActualizarEstado;

                    return (
                      <motion.div
                        key={estado}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4"
                      >
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${
                          estaCompletado 
                            ? `bg-gradient-to-br from-${estadoTimeline.color}-500 to-${estadoTimeline.color}-600` 
                            : 'bg-gray-300'
                        } ${esActual ? 'ring-4 ring-primary-300 animate-pulse-glow' : ''} transition-all`}>
                          <IconTimeline className={`w-6 h-6 ${
                            estaCompletado ? 'text-white' : 'text-gray-500'
                          }`} />
                          {estaCompletado && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className={`font-black text-base mb-2 ${
                                estaCompletado ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {estadoTimeline.label}
                              </div>
                              {entradaHistorial && (
                                <div className="text-xs text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                                  📅 {new Date(entradaHistorial.fecha).toLocaleString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {entradaHistorial.usuario && (
                                    <span className="ml-2 text-primary-600 font-bold">por {entradaHistorial.usuario}</span>
                                  )}
                                </div>
                              )}
                              {esActual && (
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold">
                                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                                  Estado actual
                                </div>
                              )}
                            </div>
                            {/* Botón para avanzar al siguiente estado */}
                            {esSiguienteEstado && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCambiarEstado(estado)}
                                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs px-4 py-2.5 flex items-center gap-2 whitespace-nowrap rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                                disabled={updateMutation.isPending}
                              >
                                {updateMutation.isPending ? (
                                  <>
                                    <ClockIcon className="w-4 h-4 animate-spin" />
                                    Actualizando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Marcar como {estadoTimeline.label}
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
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
          </motion.div>

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

        {/* Sidebar Moderno */}
        <div className="space-y-6">
          {/* Botones de Contacto */}
          {(telefonoEmpresa || direccionEmpresa) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-primary-600" />
                <span className="text-primary-600">Contacto</span>
              </h3>
              <div className="space-y-3">
                {telefonoEmpresa && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => contactarWhatsApp(whatsappEmpresa1 || telefonoEmpresa, `Hola, tengo una consulta sobre el pedido #${pedido.id.slice(0, 8)}`)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      WhatsApp Principal
                    </motion.button>
                    {whatsappEmpresa2 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => contactarWhatsApp(whatsappEmpresa2, `Hola, tengo una consulta sobre el pedido #${pedido.id.slice(0, 8)}`)}
                        className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <PhoneIcon className="w-5 h-5" />
                        WhatsApp Secundario
                      </motion.button>
                    )}
                  </>
                )}
                
                {direccionEmpresa && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => abrirGoogleMaps(direccionEmpresa)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    Ver en Google Maps
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Resumen de Información */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6"
          >
            <h3 className="font-black text-xl mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              Resumen
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 font-medium">Valor Acordado:</span>
                  <span className="font-bold text-lg">${pedido.valorAcordado.toLocaleString()}</span>
                </div>
              </div>
              {pedido.extras > 0 && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700 font-bold">Extras:</span>
                    <span className="font-black text-lg text-green-700">+ ${pedido.extras.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="font-black text-3xl text-primary-600">
                    ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Estado de Pago</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md ${
                  pedido.transferenciaVerificada 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                }`}>
                  {pedido.transferenciaVerificada ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Verificado
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-5 h-5" />
                      Pendiente
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

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
