//sidebar fica aqui pq usa em todo o sistema na rota privada

//Irei verificar para possíveis alterações... ass: Davi

import { NavLink, useNavigate } from "react-router-dom";
import {
  UserRound,
  Monitor,
  ListOrdered,
  BarChart2,
  HelpCircle,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    // Limpe token/sessão aqui se necessário
    navigate("/");
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">+</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Sanctuary Medical</span>
          <span className="sidebar-logo-unit">ALA CENTRAL</span>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="sidebar-nav">
        <NavLink to="/registro" className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }>
          <UserRound size={18} />
          Registro
        </NavLink>

        <NavLink to="/painel-tv" className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }>
          <Monitor size={18} />
          Painel TV
        </NavLink>

        <NavLink to="/fila" className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }>
          <ListOrdered size={18} />
          Fila ao Vivo
        </NavLink>

        <NavLink to="/analises" className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }>
          <BarChart2 size={18} />
          Análises
        </NavLink>
      </nav>

      {/* Rodapé */}
      <div className="sidebar-footer">
        <NavLink to="/ajuda" className="sidebar-link">
          <HelpCircle size={18} />
          Ajuda
        </NavLink>

        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
