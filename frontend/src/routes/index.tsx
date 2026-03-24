import { createBrowserRouter } from 'react-router-dom';

import DefaultLayout from '../layouts/DefaultLayout';
import Home from '../pages/Home';
import Teste from '../pages/Teste';
import TelaInicial from '@/pages/TelaInicial'; 
export const router = createBrowserRouter([

  // Rota pública (Fora do Layout padrão, tela cheia)
  {
    path: '/',
    element: <Home />,
  },

  // Rotas privadas (Todas essas vão renderizar DENTRO do DefaultLayout)
  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/teste',
        element: <Teste />,
      },
      {
        path: '/telainicial',
        element: <TelaInicial />,
      },
      // Para adicionar mais telas no futuro, é só continuar a lista aqui:
      // {
      //   path: '/fila-ao-vivo',
      //   element: <FilaAoVivo />,
      // },
    ],
  },

  // Fallback (Página 404)
  {
    path: '*',
    element: (
      <div className="p-10 text-center text-red-500 font-bold">
        404 — Página não encontrada!
      </div>
    ),
  },
]);