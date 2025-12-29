import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageModal({ imageUrl, alt, onClose, arreglo }) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2 backdrop-blur-sm"
        aria-label="Cerrar"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <div 
        className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt || 'Imagen'}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        {arreglo && (
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 text-white max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-2">{arreglo.nombre}</h3>
            {arreglo.descripcion && (
              <p className="text-gray-200 mb-2">{arreglo.descripcion}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-3xl font-bold text-primary-400">
                ${arreglo.costo?.toLocaleString()}
              </span>
              {arreglo.tipo && (
                <span className="px-3 py-1 bg-primary-600 rounded-full text-sm font-medium">
                  {arreglo.tipo.nombre}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
