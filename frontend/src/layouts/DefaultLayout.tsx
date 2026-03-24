import { Outlet, NavLink, Link } from 'react-router-dom';

export default function DefaultLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar (barra lateral de navegação) ─────────────────────────── */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <nav className="flex flex-col gap-4 flex-1">
          <Link
            to="/teste"
            className="text-xl font-bold mb-8 hover:text-blue-300 transition-colors"
          >
            PSF Central
          </Link>

          <NavLink
            to="/teste"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg transition-colors ${isActive
                ? 'bg-blue-800 text-blue-300 font-semibold shadow-inner'
                : 'hover:bg-blue-800 hover:text-blue-300'
              }`
            }
          >
            🛠️ Área de Teste
          </NavLink>

          {/*
           * adicionar as páginas reais aqui quando estiverem prontas
           * exemplo: <NavLink to="/fila" ...>🏥 Fila de Atendimento</NavLink>
           */}
        </nav>

        {/* implementar saida real quando o back-end estiver pronto (cache e token)*/}
        <NavLink to="/" className="hover:text-red-400 mt-auto">
          🚪 Sair
        </NavLink>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
}
