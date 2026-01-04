import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../api/arreglos';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArregloCard from '../components/ArregloCard';
import { useState } from 'react';
import { useTema } from '../components/TemaProvider';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ContactoSection from '../components/ContactoSection';

export default function Home() {
  const { colorPrimario, colorTexto, tituloInicio, mensajeInicio } = useTema();
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: arreglos = [], isLoading: loadingArreglos } = useQuery({
    queryKey: ['arreglos-home', { disponible: true }],
    queryFn: () => getArreglos({ disponible: true }),
    staleTime: 0, // Siempre considerar obsoleto para refrescar inmediatamente
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section Compacto y Dinámico */}
      <div 
        className="relative text-white py-16 sm:py-20 lg:py-24 overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorPrimario}dd 50%, ${colorPrimario}aa 100%)`
        }}
      >
        {/* Efectos de fondo animados - IMPRESIONANTES */}
        <div className="absolute inset-0">
          {/* Partículas flotantes - Más sutiles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -25, 0],
                x: [0, (Math.sin(i) * 30), 0],
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
              className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full blur-2xl"
              style={{
                left: `${18 + i * 18}%`,
                top: `${25 + i * 12}%`,
              }}
            />
          ))}
          
              {/* Ondas animadas - Más suaves */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.12, 0.25, 0.12],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.15, 1, 1.15],
              opacity: [0.15, 0.28, 0.15],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
              delay: 2.5
            }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-white rounded-full blur-3xl"
          />
          
          {/* Efecto de brillo móvil - Más sutil */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 3
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{ width: '40%', transform: 'skewX(-15deg)' }}
          />
        </div>

        {/* Contenido principal */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Emoji decorativo animado - Configurable - MEJORADO */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.3
            }}
            className="mb-6 relative"
          >
            {/* Efecto de halo animado detrás del emoji */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-white/30 rounded-full blur-2xl"
              style={{ transform: 'translate(-25%, -25%) scale(1.5)' }}
            />
            
            <motion.span
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                y: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                scale: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }
              }}
              className="inline-block text-6xl sm:text-7xl lg:text-8xl relative z-10"
              style={{ 
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3)) drop-shadow(0 0 40px rgba(255,255,255,0.4))',
                textShadow: '0 0 30px rgba(255,255,255,0.5)',
                transform: 'translateZ(0)'
              }}
            >
              🌸
            </motion.span>
            
            {/* Partículas alrededor del emoji */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  x: [0, Math.cos(i * 120 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 120 * Math.PI / 180) * 60],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3,
                  repeatDelay: 1
                }}
                className="absolute inset-0 text-2xl"
                style={{
                  transformOrigin: 'center',
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.4
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight relative"
            style={{
              textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)'
            }}
          >
            {/* Efecto de brillo animado detrás del texto */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 blur-xl"
              style={{ transform: 'translateZ(0)' }}
            />
            
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                textShadow: [
                  '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)',
                  '0 4px 25px rgba(0,0,0,0.4), 0 0 50px rgba(255,255,255,0.3)',
                  '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)',
                ],
              }}
              transition={{
                backgroundPosition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                },
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="block text-white bg-clip-text relative z-10"
              style={{
                backgroundImage: 'linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff, #f0f0f0)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {tituloInicio}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ 
              delay: 0.6, 
              duration: 1,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="text-lg sm:text-xl md:text-2xl mb-12 opacity-95 font-bold max-w-3xl mx-auto leading-relaxed relative"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            <motion.span
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              {mensajeInicio}
            </motion.span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.7, 
              duration: 0.6,
              type: "spring",
              stiffness: 150
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Link
                to="/catalogo"
                className="group relative inline-flex items-center gap-3 bg-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-black text-lg sm:text-xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
                style={{ color: colorPrimario }}
              >
                {/* Efecto de brillo animado sutil */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  style={{ transform: 'skewX(-20deg)' }}
                />
                
                <motion.span
                  whileHover={{ x: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative z-10"
                >
                  Explorar Catálogo
                </motion.span>
                <motion.div
                  animate={{
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative z-10"
                >
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Iconos decorativos flotantes - Más sutiles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {['🌺', '💐', '🌷', '🌻'].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.15, 1],
                  y: [0, -25, 0],
                  x: [0, Math.sin(i) * 15, 0],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.6,
                }}
                className="absolute text-3xl sm:text-4xl"
                style={{
                  left: `${12 + i * 22}%`,
                  top: `${65 + (i % 2) * 15}%`,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Arreglos Destacados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Nuestros Arreglos
              </span>
            </h2>
            <p className="text-gray-600 font-medium">
              Selecciona los arreglos perfectos para cada ocasión
            </p>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Ver Todo
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {loadingArreglos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse overflow-hidden">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : arreglosDestacados.length === 0 ? (
          <div className="text-center py-12">
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

      {/* Sección de Mapa y Contactos */}
      <ContactoSection />
    </div>
  );
}
