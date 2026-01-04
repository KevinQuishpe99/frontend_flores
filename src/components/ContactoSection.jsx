import { motion } from 'framer-motion';
import { MapPinIcon, PhoneIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { getConfiguraciones } from '../api/configuracion';
import { useTema } from './TemaProvider';
import { useState, useEffect } from 'react';

const contactarWhatsApp = (telefono, mensaje = '') => {
  if (!telefono) return;
  
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
  if (!direccion) return;
  const direccionEncoded = encodeURIComponent(direccion);
  const url = `https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`;
  window.open(url, '_blank');
};

export default function ContactoSection() {
  const { colorPrimario } = useTema();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  // Obtener configuraciones de contacto
  const { data: configData } = useQuery({
    queryKey: ['configuraciones-public'],
    queryFn: () => getConfiguraciones(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const configuraciones = configData?.data || {};
  // Valores por defecto
  const direccionEmpresa = configuraciones.direccion_empresa || 'Bogotá, Colombia';
  const whatsappEmpresa1 = configuraciones.whatsapp_empresa_1 || '+573001234567';
  const whatsappEmpresa2 = configuraciones.whatsapp_empresa_2 || '';

  // Detectar si la app es instalable
  useEffect(() => {
    // Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator.standalone === true) ||
                        document.referrer.includes('android-app://');
    
    if (isInstalled) {
      setShowInstallButton(false);
      return;
    }

    // Verificar si el usuario ya cerró el botón recientemente
    const dismissedTime = localStorage.getItem('install-button-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowInstallButton(false);
        return;
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone === true;
    
    if (isIOS && !isInStandaloneMode) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // Para iOS, mostrar instrucciones
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar esta app en iOS:\n1. Toca el botón de compartir\n2. Selecciona "Añadir a pantalla de inicio"');
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    localStorage.setItem('install-button-dismissed', Date.now().toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-white py-6 sm:py-8"
      style={{ 
        background: `linear-gradient(135deg, ${colorPrimario || '#1f2937'} 0%, ${colorPrimario || '#1f2937'}dd 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          {/* WhatsApp Principal */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => contactarWhatsApp(whatsappEmpresa1, 'Hola, me gustaría obtener más información')}
            className="group relative flex items-center gap-3 bg-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base overflow-hidden"
            style={{ color: colorPrimario || '#1f2937' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="hidden sm:inline font-bold">WhatsApp</span>
              <span className="text-[10px] sm:text-xs font-medium opacity-70 leading-tight">({whatsappEmpresa1})</span>
            </div>
          </motion.button>

          {/* WhatsApp Secundario */}
          {whatsappEmpresa2 && (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => contactarWhatsApp(whatsappEmpresa2, 'Hola, me gustaría obtener más información')}
              className="group relative flex items-center gap-3 bg-white/95 hover:bg-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base overflow-hidden"
              style={{ color: colorPrimario || '#1f2937' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
              <div className="relative z-10 flex flex-col items-start">
                <span className="hidden sm:inline font-bold">WhatsApp 2</span>
                <span className="text-[10px] sm:text-xs font-medium opacity-70 leading-tight">({whatsappEmpresa2})</span>
              </div>
            </motion.button>
          )}

          {/* Separador elegante */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-px h-10 bg-white/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div className="w-px h-10 bg-white/20"></div>
          </div>

          {/* Dirección con Mapa - Moderna */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="group flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-5 sm:px-6 py-3 sm:py-3.5 border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-white text-xs sm:text-sm font-semibold flex-1">{direccionEmpresa}</p>
            <motion.button
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => abrirGoogleMaps(direccionEmpresa)}
              className="bg-white p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 group/btn"
              style={{ color: colorPrimario || '#1f2937' }}
              title="Abrir en Google Maps"
            >
              <MapPinIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </div>

        {/* Botón de Instalación PWA - Moderno */}
        {showInstallButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex justify-center"
          >
            <div className="relative bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 shadow-lg flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="bg-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm group"
                style={{ color: colorPrimario || '#1f2937' }}
              >
                <DevicePhoneMobileIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </motion.button>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-300 text-sm w-6 h-6 flex items-center justify-center"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

