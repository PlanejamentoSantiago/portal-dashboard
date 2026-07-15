import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutList, Images, Users, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardsAdmin from '../components/admin/DashboardsAdmin';
import VitrineAdmin from '../components/admin/VitrineAdmin';
import UsersAdmin from '../components/admin/UsersAdmin';

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboards');
  const [toast, setToast] = useState(null); // { msg, err }

  const notify = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3200);
  };

  const handleNavigate = (id) => {
    if (id === 'inicio') navigate('/');
  };

  return (
    <div className="app-shell">
      <Sidebar active="admin" onNavigate={handleNavigate} />

      <main className="content">
        <div className="admin-head">
          <div>
            <button className="btn btn--ghost" onClick={() => navigate('/')} style={{ marginBottom: 12 }}>
              <ArrowLeft size={16} /> Voltar ao portal
            </button>
            <h1 className="page-title">Painel Administrativo</h1>
            <p className="page-sub">Gerencie dashboards, a vitrine da home e usuários.</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'dashboards' ? 'active' : ''}`} onClick={() => setTab('dashboards')}>
            <LayoutList size={17} /> Dashboards
          </button>
          <button className={`admin-tab ${tab === 'vitrine' ? 'active' : ''}`} onClick={() => setTab('vitrine')}>
            <Images size={17} /> Vitrine
          </button>
          <button className={`admin-tab ${tab === 'usuarios' ? 'active' : ''}`} onClick={() => setTab('usuarios')}>
            <Users size={17} /> Usuários
          </button>
        </div>

        {tab === 'dashboards' && <DashboardsAdmin notify={notify} />}
        {tab === 'vitrine' && <VitrineAdmin notify={notify} />}
        {tab === 'usuarios' && <UsersAdmin notify={notify} />}
      </main>

      {toast && (
        <div className={`toast ${toast.err ? 'toast--err' : ''}`}>
          {toast.err ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
