import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificaciones, getNotificacionesNoLeidas, marcarLeida, marcarTodasLeidas } from '../api/notificaciones';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Notificaciones() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notificaciones = [] } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: getNotificaciones,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: noLeidas = { count: 0 } } = useQuery({
    queryKey: ['notificaciones-no-leidas'],
    queryFn: getNotificacionesNoLeidas,
    refetchInterval: 30000,
  });

  const marcarLeidaMutation = useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => {
      queryClient.invalidateQueries(['notificaciones']);
      queryClient.invalidateQueries(['notificaciones-no-leidas']);
    },
  });

  const marcarTodasLeidasMutation = useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => {
      queryClient.invalidateQueries(['notificaciones']);
      queryClient.invalidateQueries(['notificaciones-no-leidas']);
      toast.success('Todas las notificaciones marcadas como leídas');
    },
  });

  const handleMarcarLeida = (id) => {
    marcarLeidaMutation.mutate(id);
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
        title="Notificaciones"
      >
        <BellIcon className="w-6 h-6" />
        {noLeidas.count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {noLeidas.count > 9 ? '9+' : noLeidas.count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notificaciones</h3>
              {notificacionesNoLeidas.length > 0 && (
                <button
                  onClick={() => marcarTodasLeidasMutation.mutate()}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notificaciones.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay notificaciones
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notificacion.leida ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notificacion.leida) {
                          handleMarcarLeida(notificacion.id);
                        }
                        if (notificacion.pedidoId) {
                          window.location.href = `/pedido/${notificacion.pedidoId}`;
                        }
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${
                            !notificacion.leida ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notificacion.titulo}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notificacion.mensaje}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notificacion.createdAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                        {!notificacion.leida && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

