import { UserPlus, MonitorPlay, ListOrdered, BarChart2, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex h-full">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div>
            <h1 className="font-bold text-blue-900 leading-tight">PSF<br/>Kelé</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-wider">ALA CENTRAL</p>
          </div>
        </div>

        <nav className="mt-4 px-4">
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
                <UserPlus size={20} /> Registro
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                <MonitorPlay size={20} /> Painel TV
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                <ListOrdered size={20} /> Fila ao Vivo
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                <BarChart2 size={20} /> Análises
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="p-4 px-8 mb-4">
        <ul className="space-y-4">
          <li>
            <a href="#" className="flex items-center gap-3 text-slate-500 hover:text-slate-800 font-medium transition-colors">
              <HelpCircle size={20} /> Ajuda
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 text-slate-500 hover:text-slate-800 font-medium transition-colors">
              <LogOut size={20} /> Sair
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}