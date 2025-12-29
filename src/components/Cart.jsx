import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { getImageUrl } from '../utils/imageUrl';
import { Link } from 'react-router-dom';

export default function Cart({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, updateNotas, clearCart, getTotal } = useCartStore();
  const total = getTotal();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <ShoppingBagIcon className="w-6 h-6 text-primary-600" />
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Carrito de Compras
                  </Dialog.Title>
                  <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
                    <p className="text-gray-400 text-sm">Agrega arreglos florales para comenzar</p>
                    <Link
                      to="/catalogo"
                      onClick={onClose}
                      className="inline-block mt-4 btn-primary"
                    >
                      Ver Catálogo
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.arregloId}
                        className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <img
                          src={getImageUrl(item.arreglo.imagenEditada || item.arreglo.imagen)}
                          alt={item.arreglo.nombre}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {item.arreglo.nombre}
                          </h3>
                          <p className="text-primary-600 font-bold text-xl mb-2">
                            ${item.arreglo.costo.toLocaleString()}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-gray-600">Cantidad:</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.arregloId, item.cantidad - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.arregloId, item.cantidad + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-gray-600 ml-auto">
                              ${(item.arreglo.costo * item.cantidad).toLocaleString()}
                            </span>
                          </div>
                          
                          <textarea
                            placeholder="Notas especiales (opcional)"
                            value={item.notas}
                            onChange={(e) => updateNotas(item.arregloId, e.target.value)}
                            className="w-full p-2 border rounded text-sm resize-none"
                            rows="2"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.arregloId)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Vaciar Carrito
                    </button>
                    <Link
                      to="/checkout"
                      onClick={onClose}
                      className="flex-1 btn-primary text-center"
                    >
                      Proceder al Pedido
                    </Link>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

