import { useState } from 'react';
import { LayoutGrid, ShieldCheck, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const favicon = `${import.meta.env.BASE_URL}favicon.png`;

/**
 * Sidebar enxuta e retrátil.
 * `active` = 'inicio' | 'admin'
 */
export default function Sidebar({ active, onNavigate }) {
  const { isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === '1'
  );

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const item = (id, label, Icon) => (
    <button
      className={`nav-item ${active === id ? 'active' : ''}`}
      onClick={() => onNavigate(id)}
      title={collapsed ? label : undefined}
    >
      <Icon size={19} strokeWidth={2} />
      <span className="nav-item__label">{label}</span>
    </button>
  );

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <div className="sidebar__logo" onClick={() => onNavigate('inicio')}>
          <img src={collapsed ? favicon : logo} alt="Santiago Advogados" />
        </div>
        <button className="sidebar__toggle" onClick={toggle} title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
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

      <button className="sidebar__logout" onClick={logout} title={collapsed ? 'Sair' : undefined}>
        <LogOut size={17} />
        <span className="nav-item__label">Sair</span>
      </button>
    </aside>
  );
}
