import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Maximize2, AlertTriangle } from 'lucide-react';
import { supabase } from '../SupabaseClient';

export default function DashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        console.error('Erro ao carregar:', error);
        setError(true);
      } else {
        setDash(data);
        // Registra o acesso (alimenta o destaque "mais usado"). Fire-and-forget.
        supabase.rpc('registrar_acesso', { dash: id }).then(({ error: e }) => {
          if (e) console.warn('registrar_acesso:', e.message);
        });
      }
    })();
  }, [id]);

  const openFullscreen = () => {
    const el = document.getElementById('bi-frame');
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  if (error) {
    return (
      <div className="center-screen">
        <AlertTriangle size={40} color="#dc2626" />
        <h2>Dashboard não encontrado</h2>
        <button className="btn btn--primary" onClick={() => navigate('/')}>
          Voltar ao portal
        </button>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(90deg, #153d7a, #0f2c57)',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{dash.titulo}</h1>
          <span style={{ fontSize: '0.78rem', color: '#c8a24a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {dash.permission_role || dash.categoria}
          </span>
        </div>

        <button
          className="btn btn--ghost"
          onClick={openFullscreen}
          style={{ marginLeft: 'auto', padding: '8px 14px' }}
        >
          <Maximize2 size={16} /> Tela cheia
        </button>
      </header>

      <div style={{ flexGrow: 1, position: 'relative', background: '#f4f6fb' }}>
        <iframe
          id="bi-frame"
          title={dash.titulo}
          src={dash.url_iframe}
          style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
          allowFullScreen
        />
      </div>
    </div>
  );
}
