import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../api/arreglos';
import { getTiposArreglo } from '../api/tiposArreglo';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ArregloCard from '../components/ArregloCard';

const ORDENAMIENTOS = {
  nombre_asc: { label: 'Nombre (A-Z)', value: 'nombre_asc' },
  nombre_desc: { label: 'Nombre (Z-A)', value: 'nombre_desc' },
  precio_asc: { label: 'Precio: Menor a Mayor', value: 'precio_asc' },
  precio_desc: { label: 'Precio: Mayor a Menor', value: 'precio_desc' },
};

const ITEMS_POR_PAGINA = 12;

export default function Catalogo() {
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('nombre_asc');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [vista, setVista] = useState('grid');
  const [paginaActual, setPaginaActual] = useState(1);
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: arreglos = [], isLoading: loadingArreglos } = useQuery({
    queryKey: ['arreglos'],
    queryFn: () => getArreglos({ disponible: true }),
  });

  const { data: tiposArreglo = [] } = useQuery({
    queryKey: ['tipos-arreglo'],
    queryFn: getTiposArreglo,
  });

  const toggleFavorito = (arregloId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const nuevosFavoritos = favoritos.includes(arregloId)
      ? favoritos.filter(id => id !== arregloId)
      : [...favoritos, arregloId];
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    toast.success(favoritos.includes(arregloId) ? 'Removido de favoritos' : 'Agregado a favoritos');
  };

  const arreglosFiltrados = useMemo(() => {
    let filtrados = arreglos.filter((arreglo) => {
      const coincideBusqueda = arreglo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                               arreglo.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
      const precio = arreglo.costo;
      const enRangoPrecio = (!precioMin || precio >= parseFloat(precioMin)) &&
                           (!precioMax || precio <= parseFloat(precioMax));

      const coincideTipo = !tipoFiltro || arreglo.tipoId === tipoFiltro;

      return coincideBusqueda && enRangoPrecio && coincideTipo;
    });

    filtrados.sort((a, b) => {
      switch (ordenamiento) {
        case 'nombre_asc':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre_desc':
          return b.nombre.localeCompare(a.nombre);
        case 'precio_asc':
          return a.costo - b.costo;
        case 'precio_desc':
          return b.costo - a.costo;
        default:
          return 0;
      }
    });

    return filtrados;
  }, [arreglos, busqueda, ordenamiento, precioMin, precioMax, tipoFiltro]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, tipoFiltro, precioMin, precioMax, ordenamiento]);

  // Calcular paginación
  const totalPaginas = Math.ceil(arreglosFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const arreglosPaginados = arreglosFiltrados.slice(inicio, fin);

  const precioMinimo = arreglos.length > 0 ? Math.min(...arreglos.map(a => a.costo)) : 0;
  const precioMaximo = arreglos.length > 0 ? Math.max(...arreglos.map(a => a.costo)) : 0;

  const handleTipoClick = (tipoId) => {
    if (tipoFiltro === tipoId) {
      setTipoFiltro(''); // Deseleccionar si ya está seleccionado
    } else {
      setTipoFiltro(tipoId);
    }
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    setTipoFiltro('');
    setBusqueda('');
    setPaginaActual(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header Compacto */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Catálogo</h1>
            <p className="text-sm text-gray-600">
              {arreglosFiltrados.length} {arreglosFiltrados.length === 1 ? 'arreglo disponible' : 'arreglos disponibles'}
              {tipoFiltro && ` • Página ${paginaActual} de ${totalPaginas}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <button
                onClick={() => setVista('grid')}
                className={`p-1.5 rounded transition-colors ${
                  vista === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista de cuadrícula"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVista('lista')}
                className={`p-1.5 rounded transition-colors ${
                  vista === 'lista' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista de lista"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                mostrarFiltros
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Filtros por Tipo - Chips */}
        {tiposArreglo.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
              <button
                onClick={() => handleTipoClick('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !tipoFiltro
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {tiposArreglo.map((tipo) => {
                const cantidad = arreglos.filter(a => a.tipoId === tipo.id).length;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => handleTipoClick(tipo.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      tipoFiltro === tipo.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tipo.nombre} {cantidad > 0 && `(${cantidad})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra de Búsqueda y Ordenamiento */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar arreglos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input pl-10 w-full text-sm"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="input w-full text-sm"
            >
              {Object.values(ORDENAMIENTOS).map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel de Filtros */}
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-4 mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary-600" />
                Filtros Avanzados
              </h3>
              {(precioMin || precioMax || tipoFiltro || busqueda) && (
                <button
                  onClick={limpiarFiltros}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <XMarkIcon className="w-3 h-3" />
                  Limpiar Todo
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precio Mínimo
                </label>
                <input
                  type="number"
                  placeholder={`Mín: $${precioMinimo.toLocaleString()}`}
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="input w-full text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precio Máximo
                </label>
                <input
                  type="number"
                  placeholder={`Máx: $${precioMaximo.toLocaleString()}`}
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="input w-full text-sm"
                  min="0"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Grid de Arreglos */}
      <div>
        {loadingArreglos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse overflow-hidden">
                <div className="h-72 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : arreglosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🌸</div>
            <p className="text-lg text-gray-600 mb-1">No se encontraron arreglos</p>
            <p className="text-sm text-gray-500">Intenta con otros filtros o búsqueda</p>
            {(tipoFiltro || busqueda || precioMin || precioMax) && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 btn-primary text-sm"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {arreglosPaginados.map((arreglo, index) => (
                <ArregloCard
                  key={arreglo.id}
                  arreglo={arreglo}
                  index={index}
                  favoritos={favoritos}
                  onToggleFavorito={toggleFavorito}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                  className={`p-2 rounded-lg border transition-all ${
                    paginaActual === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let numeroPagina;
                    if (totalPaginas <= 5) {
                      numeroPagina = i + 1;
                    } else if (paginaActual <= 3) {
                      numeroPagina = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      numeroPagina = totalPaginas - 4 + i;
                    } else {
                      numeroPagina = paginaActual - 2 + i;
                    }

                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => setPaginaActual(numeroPagina)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          paginaActual === numeroPagina
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                  className={`p-2 rounded-lg border transition-all ${
                    paginaActual === totalPaginas
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Info de paginación */}
            {totalPaginas > 1 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Mostrando {inicio + 1}-{Math.min(fin, arreglosFiltrados.length)} de {arreglosFiltrados.length} arreglos
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
