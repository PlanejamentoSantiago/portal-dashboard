import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Globe, Lock, CalendarClock, Search, Star, Sparkles } from 'lucide-react';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import Sidebar from '../components/Sidebar';
import ShowcaseCarousel from '../components/ShowcaseCarousel';
import DashboardCard from '../components/DashboardCard';
import ChangelogModal from '../components/ChangelogModal';
import { brandFor } from '../lib/brands';
import { APP_VERSION } from '../changelog';

const roleLabels = {
  gerencia: 'Gerência',
  bradesco_sa: 'Bradesco SA',
  bradesco_financiamentos: 'Bradesco Financiamentos',
  rcbitapeva_divzero: 'RCB Itapeva / DivZero',
  bsc: 'BSC',
  publico: 'Público',
};

const normalize = (s) => String(s || '').trim().toLowerCase();
const upper = (s) => String(s || '').trim().toUpperCase();

// Grupos que uma role enxerga (fora gerência, que vê tudo).
// Mantém a hierarquia: bradesco_sa também acessa o subgrupo bsc.
const rolesAcessiveis = (role) => {
  const r = normalize(role);
  if (r === 'bradesco_sa') return ['bradesco_sa', 'bsc', 'publico'];
  return [r, 'publico'];
};

export default function Home() {
  const navigate = useNavigate();
  const { userRole, profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [dashboards, setDashboards] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('todos'); // 'todos' | '<role>' | 'favoritos'
  const [query, setQuery] = useState('');
  const [showChangelog, setShowChangelog] = useState(false);

  // ---- Fetch dashboards ----
  useEffect(() => {
    if (!userRole) return;
    let alive = true;
    (async () => {
      setLoading(true);
      let q = supabase.from('dashboards').select('*');
      if (normalize(userRole) !== 'gerencia') {
        q = q.in('permission_role', rolesAcessiveis(userRole));
      }
      const { data, error } = await q;
      if (!alive) return;
      if (error) {
        console.error('Erro ao buscar dashboards:', error);
        setDashboards([]);
      } else {
        setDashboards((data || []).filter((d) => d.ativo !== false));
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [userRole]);

  // ---- Fetch vitrine ----
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('vitrine')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (!alive) return;
      if (error) { console.warn('Vitrine indisponível:', error.message); setSlides([]); }
      else setSlides(data || []);
    })();
    return () => { alive = false; };
  }, []);

  const openDashboard = (dash) => navigate(`/dashboard/${dash.id}`);

  // ---- Grupos disponíveis (tags) ----
  const groups = useMemo(() => {
    const set = new Set(dashboards.map((d) => normalize(d.permission_role)).filter(Boolean));
    return Array.from(set).sort();
  }, [dashboards]);

  // ---- Slides do carrossel ----
  // Auto: BI mais novo + BI mais usado (a lista `dashboards` já vem filtrada
  // por grupo+público via RLS, então os destaques respeitam o acesso do usuário).
  // Depois, as campanhas manuais cadastradas na vitrine.
  const carouselSlides = useMemo(() => {
    const autoImg = (d) => d.image_url || `${import.meta.env.BASE_URL}thumbnails/${d.id}.png`;
    const auto = [];

    if (dashboards.length) {
      const novo = [...dashboards].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )[0];
      const destaque = [...dashboards].sort(
        (a, b) => (b.total_acessos || 0) - (a.total_acessos || 0)
      )[0];

      if (novo) {
        auto.push({
          id: `novo-${novo.id}`, titulo: novo.titulo,
          subtitulo: novo.descricao || 'Novo dashboard disponível no portal.',
          image_url: autoImg(novo), badge: 'novo',
          ctaLabel: 'Abrir Dashboard', onAction: () => openDashboard(novo),
        });
      }
      // Só mostra "destaque" se houver acessos e for um BI diferente do "novo"
      if (destaque && destaque.id !== novo?.id && (destaque.total_acessos || 0) > 0) {
        auto.push({
          id: `destaque-${destaque.id}`, titulo: destaque.titulo,
          subtitulo: destaque.descricao || 'Um dos dashboards mais acessados.',
          image_url: autoImg(destaque), badge: 'destaque',
          ctaLabel: 'Abrir Dashboard', onAction: () => openDashboard(destaque),
        });
      }
    }

    const manuais = slides.map((s) => {
      const target = s.dashboard_id ? dashboards.find((d) => String(d.id) === String(s.dashboard_id)) : null;
      const action = s.link_externo
        ? () => window.open(s.link_externo, '_blank')
        : target ? () => openDashboard(target) : null;
      return {
        id: s.id, titulo: s.titulo, subtitulo: s.subtitulo,
        image_url: s.image_url, badge: s.badge,
        ctaLabel: 'Abrir Dashboard', onAction: action,
      };
    });

    return [...auto, ...manuais];
  }, [slides, dashboards]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const total = dashboards.length;
    const publicos = dashboards.filter((d) => normalize(d.permission_role) === 'publico').length;
    return { total, publicos, privados: total - publicos };
  }, [dashboards]);

  // ---- Filtro + ordenação (favoritos primeiro, depois alfabética) ----
  const filtered = useMemo(() => {
    let list = [...dashboards];
    if (group === 'favoritos') list = list.filter((d) => isFavorite(d.id));
    else if (group !== 'todos') list = list.filter((d) => normalize(d.permission_role) === group);

    const term = normalize(query);
    if (term) {
      list = list.filter(
        (d) => normalize(d.titulo).includes(term) ||
               normalize(d.descricao).includes(term) ||
               normalize(d.permission_role).includes(term)
      );
    }

    list.sort((a, b) => {
      const fa = isFavorite(a.id), fb = isFavorite(b.id);
      if (fa !== fb) return fa ? -1 : 1;
      return String(a.titulo).localeCompare(String(b.titulo), 'pt-BR');
    });
    return list;
  }, [dashboards, group, query, isFavorite]);

  const handleNavigate = (id) => {
    if (id === 'admin') return navigate('/admin');
    setGroup('todos');
  };

  const displayName = profile?.nome || roleLabels[userRole] || userRole;
  const initials = String(displayName).trim().slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar active="inicio" onNavigate={handleNavigate} />

      <main className="content">
        <div className="page-head">
          <div>
            <h1 className="page-title">Portal de BI</h1>
            <p className="page-sub">Olá, <b>{displayName}</b></p>
          </div>
          <div className="head-actions">
            <button className="version-pill" onClick={() => setShowChangelog(true)} title="Ver novidades">
              <Sparkles size={15} /> v{APP_VERSION.split('.').slice(0, 2).join('.')}
            </button>
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div className="user-chip__meta">
                <span className="user-chip__name">{displayName}</span>
                <span className="user-chip__role">{upper(roleLabels[userRole] || userRole)}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="center-screen" style={{ height: '50vh' }}><div className="spinner" /></div>
        ) : (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat__icon" style={{ background: '#eef3fc', color: '#153d7a' }}><FolderKanban size={22} /></div>
                <div><div className="stat__value">{stats.total}</div><div className="stat__label">Dashboards disponíveis</div></div>
              </div>
              <div className="stat">
                <div className="stat__icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><Globe size={22} /></div>
                <div><div className="stat__value">{stats.publicos}</div><div className="stat__label">Públicos</div></div>
              </div>
              <div className="stat">
                <div className="stat__icon" style={{ background: '#fef3e2', color: '#b45309' }}><Lock size={22} /></div>
                <div><div className="stat__value">{stats.privados}</div><div className="stat__label">Restritos</div></div>
              </div>
              <div className="stat">
                <div className="stat__icon" style={{ background: '#f0fdf4', color: '#15803d' }}><CalendarClock size={22} /></div>
                <div><div className="stat__value">Hoje</div><div className="stat__label">Última atualização</div></div>
              </div>
            </div>

            <ShowcaseCarousel slides={carouselSlides} />

            {/* Toolbar: busca + grupos + favoritos */}
            <div className="toolbar">
              <div className="search">
                <Search size={18} />
                <input placeholder="Pesquisar dashboards..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button className={`chip ${group === 'todos' ? 'active' : ''}`} onClick={() => setGroup('todos')}>Todos</button>
              {groups.map((g) => {
                const b = brandFor(g);
                return (
                  <button key={g} className={`chip ${group === g ? 'active' : ''}`} onClick={() => setGroup(g)}>
                    {b && <img className="chip__logo" src={b} alt="" />}
                    {upper(g)}
                  </button>
                );
              })}
              <button
                className={`chip chip--fav ${group === 'favoritos' ? 'active' : ''}`}
                onClick={() => setGroup('favoritos')}
              >
                <Star size={15} fill={group === 'favoritos' ? 'currentColor' : 'none'} /> Favoritos
              </button>
            </div>

            <div className="section-title">
              {group === 'favoritos' ? 'Seus favoritos' : group === 'todos' ? 'Todos os dashboards' : upper(g_label(group))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty">
                {group === 'favoritos'
                  ? 'Você ainda não favoritou nenhum dashboard. Toque na estrela de um card.'
                  : 'Nenhum dashboard encontrado.'}
              </div>
            ) : (
              <div className="grid">
                {filtered.map((dash) => (
                  <DashboardCard
                    key={dash.id}
                    dashboard={dash}
                    isFavorite={isFavorite(dash.id)}
                    onToggleFavorite={toggleFavorite}
                    onOpen={openDashboard}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}

function g_label(g) { return roleLabels[g] || g; }
