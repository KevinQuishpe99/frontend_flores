import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../api/arreglos';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArregloCard from '../components/ArregloCard';
import { useState } from 'react';

export default function Home() {
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: arreglos = [], isLoading: loadingArreglos } = useQuery({
    queryKey: ['arreglos-home'],
    queryFn: () => getArreglos({ disponible: true }),
  });

  const arreglosDestacados = arreglos.slice(0, 12);

  const toggleFavorito = (arregloId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const nuevosFavoritos = favoritos.includes(arregloId)
      ? favoritos.filter(id => id !== arregloId)
      : [...favoritos, arregloId];
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section Mejorado */}
      <div className="relative bg-gradient-to-br from-primary-500 via-floral-500 to-pink-500 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            🌸 Arreglos Florales Excepcionales
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl mb-8 opacity-95"
          >
            Descubre nuestra colección única de arreglos florales artesanales
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              to="/catalogo"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Explorar Catálogo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Arreglos Destacados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Nuestros Arreglos</h2>
            <p className="text-gray-600">Selecciona los arreglos perfectos para cada ocasión</p>
          </div>
          <Link
            to="/catalogo"
            className="text-primary-600 hover:text-primary-700 font-semibold text-lg flex items-center gap-2"
          >
            Ver todo
            <span>→</span>
          </Link>
        </div>

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
        ) : arreglosDestacados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-xl text-gray-600 mb-2">No hay arreglos disponibles aún</p>
            <p className="text-gray-500">Vuelve pronto para ver nuestra colección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {arreglosDestacados.map((arreglo, index) => (
              <ArregloCard
                key={arreglo.id}
                arreglo={arreglo}
                index={index}
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para hacer tu pedido?</h2>
          <p className="text-xl mb-8 opacity-90">
            Explora nuestro catálogo completo y encuentra el arreglo perfecto
          </p>
          <Link
            to="/catalogo"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Ver Catálogo Completo
          </Link>
        </div>
      </div>
    </div>
  );
}
