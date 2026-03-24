import { useNavigate } from 'react-router-dom';
import { Hospital } from 'lucide-react';
import BotaoEntrar from '../../components/BotaoEntrar';

export default function Home() {
  const navigate = useNavigate();

  const handleEntrar = () => {
    navigate('/telainicial');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 p-6 font-sans">
      
 
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center">
        
     
        <div className="mb-6">
          <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hospital size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">PSF Central</h1>
          <p className="text-gray-500 mt-2">Sistema de Gerenciamento de Filas</p>
        </div>

     
        <div className="space-y-4 mb-8 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input 
              type="text" 
              placeholder="Digite sua matrícula" 
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        
        <div className="w-full flex justify-center">
          <BotaoEntrar onClick={handleEntrar} className="w-full" />
        </div>
        
      </div>

    </div>
  );
}