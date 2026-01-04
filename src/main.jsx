import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import TemaProvider from './components/TemaProvider.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Los datos se consideran obsoletos inmediatamente
      cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Verificar que el clientId no esté vacío
const hasValidGoogleClientId = googleClientId && googleClientId.trim() !== '';

// Componente que envuelve la app condicionalmente con GoogleOAuthProvider
const AppWrapper = ({ children }) => {
  if (hasValidGoogleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    );
  }
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <TemaProvider>
            <App />
          </TemaProvider>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </AppWrapper>
  </React.StrictMode>,
)

