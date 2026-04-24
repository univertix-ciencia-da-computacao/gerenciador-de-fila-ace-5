import { Outlet, NavLink } from 'react-router-dom';
import {
  UserPlus,
  Monitor,
  AlignJustify,
  BarChart2,
  HelpCircle,
  LogOut,
  Clock,
  Bell,
  Settings,
  UserCircle2,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: UserPlus, label: 'Registro' },
  { to: '/painel-tv', icon: Monitor, label: 'Painel TV' },
  { to: '/fila-vivo', icon: AlignJustify, label: 'Fila ao Vivo' },
  { to: '/analises', icon: BarChart2, label: 'Análises' },
];

export default function DefaultLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-52 bg-blue-900 text-white flex flex-col h-full flex-shrink-0">

        {/* Logo / Identidade */}
        <div className="px-5 py-6 flex items-center gap-3 select-none border-b border-blue-800 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-400 to-emerald-400 text-blue-900 p-2 rounded-xl shadow-lg shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black tracking-tight text-white">PSF</span>
            <span className="text-sm font-bold text-white">Kelé</span>
            <span className="text-[10px] font-medium text-blue-300 tracking-widest uppercase">ALA CENTRAL</span>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="px-3 py-4 border-t border-blue-800 flex flex-col gap-1 flex-shrink-0">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors text-sm font-medium w-full text-left">
            <HelpCircle className="w-4 h-4 shrink-0" />
            Ajuda
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </NavLink>
        </div>
      </aside>

      {/* Área principal com header + conteúdo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header / Topo */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Gerenciamento de Fila</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Portal Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-slate-600 transition-colors">
              <Clock className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="hover:text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <UserCircle2 className="w-9 h-9 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}