import { Outlet, NavLink } from 'react-router-dom';

export default function DefaultLayout() {
  return (

    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">

      {/* Sidebar separar em arquivo separado */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col h-full flex-shrink-0">
        
 
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


        <nav className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${isActive
                ? 'bg-blue-800 text-blue-300 font-semibold shadow-inner'
                : 'hover:bg-blue-800 hover:text-blue-300'
              }`
            }
          >
            📋 Administrativo
          </NavLink>
        </nav>

        {/* Rodapé da Sidebar fixo no final */}
        <div className="pt-6 mt-auto border-t border-blue-800 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-2 hover:text-red-400 transition-colors">
            🚪 Sair
          </NavLink>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 h-full overflow-hidden">
        <Outlet />
      </main>

    </div>
  );
}