//sidebar fica aqui pq usa em todo o sistema na rota privadaimport { NavLink, useNavigate } from 'react-router-dom';
import {
  UserRound,
  Monitor,
  ListOrdered,
  BarChart2,
  HelpCircle,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    // Limpe token/sessão aqui se necessário
    navigate('/');
  }

  const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors';
  const linkActive = 'bg-white text-blue-900 font-semibold shadow-sm';
  const linkIdle = 'text-blue-300 hover:bg-blue-800 hover:text-white';

  return (
    <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col h-full flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 select-none flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-400 to-emerald-400 text-blue-900 p-2 rounded-xl shadow-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
          </svg>
        </div>
        <h1 className="flex flex-col leading-none">
          <span className="text-2xl font-black tracking-tight text-white">PSF</span>
          <span className="text-sm font-medium text-blue-300 tracking-widest uppercase mt-1">Central</span>
        </h1>
      </div>

      {/* Navegação principal */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        <NavLink
          to="/registro"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <UserRound size={18} />
          Registro
        </NavLink>

        <NavLink
          to="/painel-tv"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <Monitor size={18} />
          Painel TV
        </NavLink>

        <NavLink
          to="/fila"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <ListOrdered size={18} />
          Fila ao Vivo
        </NavLink>

        <NavLink
          to="/analises"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <BarChart2 size={18} />
          Análises
        </NavLink>
      </nav>

      {/* Rodapé */}
      <div className="pt-6 mt-auto border-t border-blue-800 flex-shrink-0 flex flex-col gap-1">
        <NavLink
          to="/ajuda"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <HelpCircle size={18} />
          Ajuda
        </NavLink>

        <button
          onClick={handleLogout}
          className={`${linkBase} ${linkIdle} w-full text-left`}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

    </aside>
  );
}
