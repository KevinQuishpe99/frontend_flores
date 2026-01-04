import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { getImageUrl } from '../utils/imageUrl';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
            <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ShoppingBagIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Dialog.Title className="text-2xl font-black text-white">
                      Carrito de Compras
                    </Dialog.Title>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold mt-1 inline-block">
                      {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <ShoppingBagIcon className="w-12 h-12 text-primary-500" />
                    </div>
                    <p className="text-gray-700 text-xl font-bold mb-2">Tu carrito está vacío</p>
                    <p className="text-gray-500 text-sm mb-6">Agrega arreglos florales para comenzar</p>
                    <Link
                      to="/catalogo"
                      onClick={onClose}
                      className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      Explorar Catálogo
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.arregloId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all">
                            <img
                              src={getImageUrl(item.arreglo.imagenEditada || item.arreglo.imagen)}
                              alt={item.arreglo.nombre}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-1.5 text-gray-900 group-hover:text-primary-600 transition-colors">
                              {item.arreglo.nombre}
                            </h3>
                            <p className="text-primary-600 font-black text-xl mb-3">
                              ${item.arreglo.costo.toLocaleString()}
                            </p>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <label className="text-sm font-semibold text-gray-700">Cantidad:</label>
                              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                <button
                                  onClick={() => updateQuantity(item.arregloId, item.cantidad - 1)}
                                  className="w-8 h-8 rounded-lg bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-600 flex items-center justify-center font-bold shadow-sm transition-all"
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.arregloId, item.cantidad + 1)}
                                  className="w-8 h-8 rounded-lg bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-600 flex items-center justify-center font-bold shadow-sm transition-all"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-gray-700 ml-auto font-bold text-lg">
                                ${(item.arreglo.costo * item.cantidad).toLocaleString()}
                              </span>
                            </div>
                            
                            <textarea
                              placeholder="Notas especiales (opcional)"
                              value={item.notas}
                              onChange={(e) => updateNotas(item.arregloId, e.target.value)}
                              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                              rows="2"
                            />
                          </div>
                          <button
                            onClick={() => removeItem(item.arregloId)}
                            className="self-start p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t-2 border-gray-200 p-6 bg-gradient-to-br from-primary-50 to-white"
                >
                  <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-sm">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-black text-primary-600">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold text-gray-700"
                    >
                      Vaciar Carrito
                    </button>
                    <Link
                      to="/checkout"
                      onClick={onClose}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-center px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      Proceder al Pedido
                    </Link>
                  </div>
                </motion.div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

