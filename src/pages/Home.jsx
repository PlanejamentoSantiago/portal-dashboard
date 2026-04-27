import { useEffect, useState, useMemo } from 'react'
import { supabase } from "../SupabaseClient";
import CardDashboard from '../components/CardDashboard'
import { useAuth } from '../context/AuthContext';
import logoutIcon from '../assets/logout.png';
import logo from '../assets/logo.png';

export default function Home() {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Todos')
  const [selectedDash, setSelectedDash] = useState(null)

  const { logout, userRole } = useAuth();

  const normalize = (str) => str?.trim().toLowerCase();

  const roleLabels = {
    gerencia: 'Gerência',
    bradesco_sa: 'Bradesco SA',
    bradesco_financiamentos: 'Bradesco Financiamentos',
    rcbitapeva_divzero: 'RCB Itapeva / DivZero'
  };

  const menus = [
    { id: 'Todos', label: 'Todos os Projetos' },
    { id: 'bradesco_sa', label: 'Bradesco SA' },
    { id: 'bradesco_financiamentos', label: 'Bradesco Financiamentos' },
    { id: 'rcbitapeva_divzero', label: 'RCB Itapeva / DivZero' },
  ];

  // 🔥 FETCH COM SUPORTE A PUBLICO
  useEffect(() => {
    if (!userRole) return;

    let isMounted = true;

    async function getDashboards() {
      setLoading(true)

      const role = normalize(userRole);

      if (!role) {
        setLoading(false);
        return;
      }

      let query = supabase.from('dashboards').select('*')

      if (role !== 'gerencia') {
        query = query.in('permission_role', [
          role,
          'publico'
        ])
      }

      const { data, error } = await query

      if (!isMounted) return;

      if (error) {
        console.error('Erro ao buscar dados:', error)
        setDashboards([])
      } else {
        setDashboards(data || [])
      }

      setLoading(false)
    }

    getDashboards()

    return () => {
      isMounted = false;
    };

  }, [userRole])

  // 🚀 FILTRO CORRETO (SEM PUBLICO NAS ABAS)
  const filteredDashboards = useMemo(() => {
    if (!dashboards.length) return [];

    if (activeTab === 'Todos') return dashboards;

    return dashboards.filter(d =>
      normalize(d.permission_role) === normalize(activeTab)
    );
  }, [dashboards, activeTab]);

  const handleFilter = (roleId) => {
    setActiveTab(roleId);
    setSelectedDash(null);
  };

  // 🔒 LOADING
  if (loading || !userRole) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#153d7a'
    }}>
      Carregando portais...
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '260px',
        backgroundColor: '#153d7a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* LOGO */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #0f2c57',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => handleFilter('Todos')}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ width: '160px', height: 'auto' }}
          />
        </div>

        <nav style={{ padding: '20px 0' }}>
          {menus.map((menu) => (
            (normalize(userRole) === 'gerencia' || menu.id === userRole || menu.id === 'Todos') && (
              <button
                key={menu.id}
                onClick={() => handleFilter(menu.id)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === menu.id ? '#0f2c57' : 'transparent',
                  color: activeTab === menu.id ? '#ffffff' : '#cbd5e1'
                }}
              >
                {menu.label}
              </button>
            )
          ))}
        </nav>

        {/* LOGOUT */}
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0f2c57',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <img
              src={logoutIcon}
              alt="Logout"
              style={{ width: '18px', height: '18px' }}
            />
            Sair
          </button>
        </div>

      </aside>

      {/* CONTEÚDO */}
      <main style={{ 
        flex: 1, 
        padding: '40px',
        overflowY: 'auto'
      }}>

        {selectedDash ? (
          <>
            <button onClick={() => setSelectedDash(null)}>
              ← Voltar
            </button>

            <iframe
              title={selectedDash.titulo}
              src={selectedDash.url_iframe}
              style={{ width: '100%', height: '80vh', border: 'none' }}
            />
          </>
        ) : (
          <>
            <h1>
              {activeTab === 'Todos' 
                ? 'Todos os Projetos' 
                : roleLabels[activeTab] || activeTab}
            </h1>

            <p>
              Olá, <strong style={{ color: '#c8a24a' }}>
                {roleLabels[userRole] || userRole}
              </strong>
            </p>

            {/* GRID */}
            {filteredDashboards.length === 0 ? (
              <p style={{ color: '#64748b' }}>
                Nenhum dashboard disponível.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {filteredDashboards.map((dash) => (
                  <div key={dash.id} onClick={() => setSelectedDash(dash)}>
                    <CardDashboard dashboard={dash} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}