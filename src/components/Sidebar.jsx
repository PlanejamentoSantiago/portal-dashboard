import { LayoutGrid, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

/**
 * Sidebar enxuta do portal.
 * `active` = 'inicio' | 'admin'
 */
export default function Sidebar({ active, onNavigate }) {
  const { isAdmin, logout } = useAuth();

  const item = (id, label, Icon) => (
    <button
      className={`nav-item ${active === id ? 'active' : ''}`}
      onClick={() => onNavigate(id)}
    >
      <Icon size={19} strokeWidth={2} />
      {label}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__logo" onClick={() => onNavigate('inicio')}>
        <img src={logo} alt="Santiago Advogados" />
      </div>

      <div className="sidebar__section">Portal</div>
      {item('inicio', 'Início', LayoutGrid)}

      {isAdmin && (
        <>
          <div className="sidebar__section">Administração</div>
          {item('admin', 'Painel Admin', ShieldCheck)}
        </>
      )}

      <div className="sidebar__spacer" />

      <button className="sidebar__logout" onClick={logout}>
        <LogOut size={17} />
        Sair
      </button>
    </aside>
  );
}
