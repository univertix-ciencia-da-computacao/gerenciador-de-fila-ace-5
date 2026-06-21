import { createBrowserRouter } from 'react-router-dom';

import DefaultLayout from '../layouts/DefaultLayout';
import Home from '../pages/Login';
import Register from '../pages/DashboardAdmin';
import DashboardQueue from '../pages/DashboardQueue';
import DashboardRegistration from '../pages/DashboardRegistration';
import PatientTracking from '../pages/PatientTracking';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([

  // Rota pública

  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/acompanhar/:token',
    element: <PatientTracking />,
  },

  // Rotas privadas (dentro do DefaultLayout)

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Register />,
          },
          {
            path: '/dashboard/inscricao',
            element: <DashboardRegistration />,
          },
          {
            path: '/dashboard/fila',
            element: <DashboardQueue />,
          },
        ],
      },
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
