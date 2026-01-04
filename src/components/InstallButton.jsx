import { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
    
    if (isStandalone || (isIOS && isInStandaloneMode)) {
      setIsInstalled(true);
      return;
    }

    // Detectar evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir el prompt automático
      e.preventDefault();
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      setShowButton(true);
    };

    // Detectar si la app ya fue instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
      setDeferredPrompt(null);
      toast.success('¡App instalada correctamente!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar si ya está instalado al cargar
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true);
      setShowButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si no hay prompt disponible, mostrar instrucciones para iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast(
          <div className="text-sm">
            <p className="font-semibold mb-2">Para instalar en iOS:</p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Toca el botón de compartir</li>
              <li>Selecciona "Añadir a pantalla de inicio"</li>
            </ol>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error('La instalación no está disponible en este momento');
      }
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('¡Instalación iniciada!');
      setDeferredPrompt(null);
      setShowButton(false);
      localStorage.setItem('pwa-installed', 'true');
    } else {
      toast.info('Instalación cancelada');
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowButton(false);
    // No mostrar de nuevo por 7 días
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // Verificar si fue descartado recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowButton(false);
      }
    }
  }, []);

  // No mostrar si ya está instalado o no hay prompt disponible
  if (isInstalled || !showButton) {
    return null;
  }

  // Solo mostrar en dispositivos móviles o tablets
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <DevicePhoneMobileIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Instalar App
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Añade Flores a tu pantalla de inicio para acceso rápido
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 btn-primary text-xs py-1.5 px-3 font-medium"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

