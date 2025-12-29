import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// Función para obtener IP local
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        if (address.address.startsWith('192.168.') || address.address.startsWith('10.')) {
          return address.address;
        }
      }
    }
  }
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return 'localhost';
};

const BACKEND_IP = process.env.VITE_BACKEND_IP || '192.168.100.146';
const BACKEND_PORT = process.env.VITE_BACKEND_PORT || '5000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde cualquier IP en la red local
    port: 5173,
    strictPort: false, // Si el puerto está ocupado, intenta otro
    // Configuración para HMR (Hot Module Replacement) desde dispositivos móviles
    // Comentar HMR si causa problemas desde celular
    // hmr: {
    //   protocol: 'ws',
    //   host: '192.168.100.146',
    //   port: 5173,
    //   clientPort: 5173,
    // },
    // Configuración del proxy para las peticiones API
    proxy: {
      '/api': {
        target: `http://${BACKEND_IP}:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,
        ws: true, // Habilitar WebSocket para HMR
        // Configuración adicional para permitir acceso desde cualquier origen
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Agregar headers necesarios
            proxyReq.setHeader('Origin', `http://${BACKEND_IP}:${BACKEND_PORT}`);
          });
        },
      },
    },
    // Configuración adicional para mejorar el acceso desde red local
    cors: true,
  },
})

