import { Bell, Settings, Clock } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-8 pb-4 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-blue-900">Gerenciamento de Fila</h2>
        <span className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full tracking-wide">PORTAL ADMIN</span>
      </div>
      <div className="flex items-center gap-6 text-slate-400">
        <Clock size={20} className="cursor-pointer hover:text-slate-600" />
        <div className="relative cursor-pointer hover:text-slate-600">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <Settings size={20} className="cursor-pointer hover:text-slate-600" />
        <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
          {/*Puxar foto de perfil do usuario*/}
          <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}