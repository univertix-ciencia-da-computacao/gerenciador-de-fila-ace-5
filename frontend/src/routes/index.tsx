import { createBrowserRouter } from 'react-router-dom';

import DefaultLayout from '../layouts/DefaultLayout';
import Home from '../pages/Home';
import Teste from '../pages/Teste';

export const router = createBrowserRouter([

  // Rota pública

  {
    path: '/',
    element: <Home />,
  },

  // Rotas privadas (dentro do DefaultLayout)

  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/teste',
        element: <Teste />,
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