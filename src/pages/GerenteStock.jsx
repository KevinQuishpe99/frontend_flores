import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStock, getStockStats, createStock, updateStock, deleteStock } from '../api/stock';
import { getArreglos } from '../api/arreglos';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUrl';
import ImageUpload from '../components/ImageUpload';

const ESTADOS_STOCK = {
  DISPONIBLE: { label: 'Disponible', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
  VENDIDO: { label: 'Vendido', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
  RESERVADO: { label: 'Reservado', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export default function GerenteStock() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [formData, setFormData] = useState({
    arregloId: '',
    cantidad: '1',
    precioVenta: '',
    notas: '',
  });
  const [imagenStock, setImagenStock] = useState(null);
  const [imagenStockPreview, setImagenStockPreview] = useState(null);

  const { data: stock = [], isLoading } = useQuery({
    queryKey: ['stock', filtroEstado],
    queryFn: () => getStock(filtroEstado ? { estado: filtroEstado } : {}),
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  const { data: stats } = useQuery({
    queryKey: ['stock-stats'],
    queryFn: getStockStats,
    enabled: user?.rol === 'GERENTE' || user?.rol === 'ADMIN',
  });

  const { data: arreglos = [] } = useQuery({
    queryKey: ['arreglos'],
    queryFn: getArreglos,
    enabled: showCrearModal || showEditarModal,
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('arregloId', data.arregloId);
      formDataToSend.append('cantidad', data.cantidad);
      formDataToSend.append('precioVenta', data.precioVenta);
      if (data.notas) formDataToSend.append('notas', data.notas);
      if (data.imagen) formDataToSend.append('imagen', data.imagen);
      
      return api.post('/stock', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stock']);
      queryClient.invalidateQueries(['stock-stats']);
      toast.success('Stock creado exitosamente');
      setShowCrearModal(false);
      setFormData({ arregloId: '', cantidad: '1', precioVenta: '', notas: '' });
      setImagenStock(null);
      setImagenStockPreview(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear stock');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock']);
      queryClient.invalidateQueries(['stock-stats']);
      toast.success('Stock actualizado');
      setShowEditarModal(false);
      setSelectedStock(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar stock');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStock,
    onSuccess: () => {
      queryClient.invalidateQueries(['stock']);
      queryClient.invalidateQueries(['stock-stats']);
      toast.success('Artículo eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    },
  });

  const handleImageSelect = (file, editedImageDataUrl) => {
    if (editedImageDataUrl) {
      // Si hay imagen editada, convertirla a File
      fetch(editedImageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const imageFile = new File([blob], 'imagen-stock.jpg', { type: 'image/jpeg' });
          setImagenStock(imageFile);
          setImagenStockPreview(editedImageDataUrl);
        })
        .catch(err => {
          console.error('Error al procesar imagen:', err);
          toast.error('Error al procesar la imagen');
        });
    } else if (file) {
      setImagenStock(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenStockPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrear = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      imagen: imagenStock,
    };
    createMutation.mutate(dataToSend);
  };

  const handleEditar = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: selectedStock.id,
      data: {
        precioVenta: formData.precioVenta,
        estado: formData.estado,
        notas: formData.notas,
      },
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este artículo?')) {
      deleteMutation.mutate(id);
    }
  };

  const stockDisponible = stock.filter(s => s.estado === 'DISPONIBLE');
  const stockVendido = stock.filter(s => s.estado === 'VENDIDO');

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gestión de Inventario</h1>
            <p className="text-gray-600 text-sm sm:text-base">Administra el stock de arreglos disponibles</p>
          </div>
          <button
            onClick={() => setShowCrearModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar al Stock
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Disponible</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.disponible}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Vendido</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.vendido}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-gray-600">Valor Total</span>
            </div>
            <p className="text-lg font-bold text-primary-600">
              ${stats.valorTotalDisponible?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFiltroEstado('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtroEstado === '' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado('DISPONIBLE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtroEstado === 'DISPONIBLE' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Disponible
        </button>
        <button
          onClick={() => setFiltroEstado('VENDIDO')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtroEstado === 'VENDIDO' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Vendido
        </button>
        <button
          onClick={() => setFiltroEstado('RESERVADO')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtroEstado === 'RESERVADO' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Reservado
        </button>
      </div>

      {/* Lista de Stock */}
      {stock.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay artículos en stock</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stock.map((item) => {
            const estadoInfo = ESTADOS_STOCK[item.estado] || ESTADOS_STOCK.DISPONIBLE;
            return (
              <div key={item.id} className="card">
                <div className="flex gap-3 mb-3">
                  <img
                    src={getImageUrl(item.imagen || item.arreglo.imagenEditada || item.arreglo.imagen, { width: 100, height: 100 })}
                    alt={item.arreglo.nombre}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{item.arreglo.nombre}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.arreglo.descripcion}</p>
                    <p className="text-primary-600 font-bold mt-1 text-sm sm:text-base">
                      ${item.precioVenta.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                    {estadoInfo.label}
                  </span>
                  {item.vendidoPor && (
                    <span className="text-xs text-gray-500">
                      Vendido por: {item.vendidoPor.nombre}
                    </span>
                  )}
                </div>

                {item.notas && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.notas}</p>
                )}

                <div className="flex gap-2">
                  {item.estado === 'DISPONIBLE' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedStock(item);
                          setFormData({
                            precioVenta: item.precioVenta.toString(),
                            estado: item.estado,
                            notas: item.notas || '',
                          });
                          setShowEditarModal(true);
                        }}
                        className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                      </button>
                      {user?.rol === 'ADMIN' && (
                        <button
                          onClick={() => handleEliminar(item.id)}
                          className="btn-secondary text-sm p-2"
                          disabled={deleteMutation.isPending}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear */}
      {showCrearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Agregar al Stock</h2>
            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arreglo *
                </label>
                <select
                  value={formData.arregloId}
                  onChange={(e) => setFormData({ ...formData, arregloId: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Selecciona un arreglo</option>
                  {arreglos.map((arreglo) => (
                    <option key={arreglo.id} value={arreglo.id}>
                      {arreglo.nombre} - ${arreglo.costo.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="input w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del Artículo en Stock
                  <span className="text-xs text-gray-500 ml-2">(Opcional - Foto del artículo físico)</span>
                </label>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  currentImage={imagenStockPreview}
                  label=""
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sube una foto del artículo físico que tienes en stock. Si no subes foto, se usará la imagen del catálogo.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCrearModal(false);
                    setFormData({ arregloId: '', cantidad: '1', precioVenta: '', notas: '' });
                    setImagenStock(null);
                    setImagenStockPreview(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditarModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Editar Stock</h2>
            <form onSubmit={handleEditar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="input w-full"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="input w-full"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditarModal(false);
                    setSelectedStock(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

