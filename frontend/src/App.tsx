import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; // Importa a rotas do layout em JSON

export default function App() {
  return (
    //le a rota do routes
    <RouterProvider router={router} />
  );
}