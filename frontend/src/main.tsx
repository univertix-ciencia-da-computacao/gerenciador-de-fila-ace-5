import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';

// Instancia o QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // tempo do cache (5 minutos)
      refetchOnWindowFocus: true, 
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* Erros personalizado com toaster */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#334155',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },

          success: {
            style: { 
              background: '#059669', 
              color: 'white' 
            }, 
            iconTheme: {
              primary: 'white',
              secondary: '#059669',
            },
          },

          error: {
            style: { 
              background: '#ef4444', 
              color: 'white'  
            },
            iconTheme: {
              primary: 'white',
              secondary: '#ef4444',
            },
          },
        }} 
      />
    </QueryClientProvider>
  </StrictMode>,
)