import { createBrowserRouter } from 'react-router-dom';

import DefaultLayout from '../layouts/DefaultLayout';
import Home from '../pages/Login';
import Register from '../pages/DashboardAdmin';
import DashboardTv from '../pages/DashboardTv';
export const router = createBrowserRouter([

  // Rota pública

  {
    path: '/',
    element: <Home />,
  },

    {
    path: '/dashboard-tv',
    element: <DashboardTv />,
  },

  // Rotas privadas (dentro do DefaultLayout)

  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Register />,
      },

      // adicionar novas páginas aqui à medida que forem criadas
      // Exemplo:
      // { path: '/fila',      element: <Fila /> }

    ],
  },

  //Fallback
  
  {
    path: '*',
    element: (
      <div className="p-10 text-center text-red-500 font-bold">
        404 — Página não encontrada!
      </div>
    ),
  },
]);