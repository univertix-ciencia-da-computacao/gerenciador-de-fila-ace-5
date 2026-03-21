import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

//Instancia o QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, //muda o time do cache
      refetchOnWindowFocus: true, 
    },
  },
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provider na aplicação */}
    <QueryClientProvider client={queryClient}>
          <App />
    </QueryClientProvider>
  </StrictMode>,
)
