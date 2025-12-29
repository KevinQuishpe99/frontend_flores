import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPedidos } from '../api/pedidos';
import { useAuthStore } from '../store/authStore';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function Contabilidad() {
  const { user } = useAuthStore();
  const [filtroFecha, setFiltroFecha] = useState('mes'); // 'hoy', 'semana', 'mes', 'año', 'todo'

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-contabilidad'],
    queryFn: () => getPedidos(),
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  // Filtrar pedidos por fecha
  const filtrarPorFecha = (pedidos) => {
    const ahora = new Date();
    const filtrados = pedidos.filter(p => {
      const fechaPedido = new Date(p.createdAt);
      
      switch (filtroFecha) {
        case 'hoy':
          return fechaPedido.toDateString() === ahora.toDateString();
        case 'semana':
          const semanaAtras = new Date(ahora);
          semanaAtras.setDate(ahora.getDate() - 7);
          return fechaPedido >= semanaAtras;
        case 'mes':
          const mesAtras = new Date(ahora);
          mesAtras.setMonth(ahora.getMonth() - 1);
          return fechaPedido >= mesAtras;
        case 'año':
          const añoAtras = new Date(ahora);
          añoAtras.setFullYear(ahora.getFullYear() - 1);
          return fechaPedido >= añoAtras;
        default:
          return true;
      }
    });
    return filtrados;
  };

  const pedidosFiltrados = filtrarPorFecha(pedidos);
  const pedidosCompletados = pedidosFiltrados.filter(p => p.estado === 'COMPLETADO');
  const pedidosPendientes = pedidosFiltrados.filter(p => 
    ['PENDIENTE', 'TRANSFERENCIA_VERIFICADA', 'ASIGNADO', 'EN_PROCESO'].includes(p.estado)
  );

  // Calcular estadísticas
  const ingresosTotales = pedidosCompletados.reduce((sum, p) => sum + (p.valorAcordado + (p.extras || 0)), 0);
  const ingresosPendientes = pedidosPendientes.reduce((sum, p) => sum + (p.valorAcordado + (p.extras || 0)), 0);
  const totalPedidos = pedidosFiltrados.length;
  const pedidosCompletadosCount = pedidosCompletados.length;
  const promedioPedido = pedidosCompletados.length > 0 
    ? ingresosTotales / pedidosCompletados.length 
    : 0;

  // Estadísticas por día (últimos 7 días)
  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    return fecha.toDateString();
  }).reverse();

  const ingresosPorDia = ultimos7Dias.map(fecha => {
    const pedidosDelDia = pedidosCompletados.filter(p => 
      new Date(p.createdAt).toDateString() === fecha
    );
    return {
      fecha,
      ingresos: pedidosDelDia.reduce((sum, p) => sum + (p.valorAcordado + (p.extras || 0)), 0),
      cantidad: pedidosDelDia.length,
    };
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contabilidad</h1>
        <p className="text-gray-600 text-sm sm:text-base">Resumen de ventas e ingresos</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['hoy', 'semana', 'mes', 'año', 'todo'].map((opcion) => (
          <button
            key={opcion}
            onClick={() => setFiltroFecha(opcion)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroFecha === opcion
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opcion === 'hoy' ? 'Hoy' :
             opcion === 'semana' ? 'Semana' :
             opcion === 'mes' ? 'Mes' :
             opcion === 'año' ? 'Año' : 'Todo'}
          </button>
        ))}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-700">
                ${ingresosTotales.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos Pendientes</p>
              <p className="text-2xl font-bold text-blue-700">
                ${ingresosPendientes.toLocaleString()}
              </p>
            </div>
            <ClockIcon className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pedidos Completados</p>
              <p className="text-2xl font-bold text-purple-700">
                {pedidosCompletadosCount}
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Promedio por Pedido</p>
              <p className="text-2xl font-bold text-orange-700">
                ${promedioPedido.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <ShoppingBagIcon className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Gráfico de ingresos últimos 7 días */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Ingresos Últimos 7 Días</h2>
        <div className="space-y-3">
          {ingresosPorDia.map((dia, index) => {
            const maxIngreso = Math.max(...ingresosPorDia.map(d => d.ingresos), 1);
            const porcentaje = (dia.ingresos / maxIngreso) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-600">
                  {new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-24 text-right">
                      ${dia.ingresos.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {dia.cantidad} {dia.cantidad === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de pedidos recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pedidos Recientes</h2>
          <button
            onClick={() => {
              // Exportar a CSV
              const csv = [
                ['ID', 'Cliente', 'Estado', 'Valor', 'Fecha'].join(','),
                ...pedidosFiltrados.slice(0, 20).map(p => [
                  p.id.slice(0, 8),
                  `"${p.cliente.nombre} ${p.cliente.apellido}"`,
                  p.estado,
                  p.valorAcordado + (p.extras || 0),
                  format(new Date(p.createdAt), 'yyyy-MM-dd')
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `pedidos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-right p-2">Valor</th>
                <th className="text-right p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.slice(0, 20).map((pedido) => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs">
                    {pedido.id.slice(0, 8)}
                  </td>
                  <td className="p-2">
                    {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      pedido.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800' :
                      pedido.estado === 'EN_PROCESO' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2 text-right font-semibold">
                    ${(pedido.valorAcordado + (pedido.extras || 0)).toLocaleString()}
                  </td>
                  <td className="p-2 text-right text-gray-600">
                    {new Date(pedido.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

