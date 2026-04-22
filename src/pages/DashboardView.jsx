import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient';
import backButton from '../assets/back_button.png';

export default function DashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error("Erro ao carregar:", error);
        setError(true);
      } else {
        setDash(data);
      }
    }
    loadDashboard();
  }, [id]);

  if (error) return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      background: '#f9fafb',
      height: '100vh'
    }}>
      <h2 style={{ color: '#1f2937' }}>Dashboard não encontrado</h2>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '6px',
          backgroundColor: '#0f2c57',
          color: '#fff',
          border: 'none',
          fontWeight: '600'
        }}
      >
        Voltar para Home
      </button>
    </div>
  );

  if (!dash) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f9fafb',
      color: '#153d7a'
    }}>
      <p>Carregando visualizador...</p>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden' 
    }}>
      
      {/* HEADER */}
      <header style={{ 
        padding: '12px 24px',
        backgroundColor: '#153d7a',
        borderBottom: '1px solid #0f2c57',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10
      }}>
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: '6px',
            border: '1px solid #0f2c57',
            backgroundColor: '#0f2c57',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1f4f9c'}
          onMouseOut={(e) => e.currentTarget.style.background = '#0f2c57'}
        >
          {"< Voltar"}
        </button>

        {/* TÍTULO */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.15rem', 
            color: '#ffffff',
            fontWeight: '600' 
          }}>
            {dash.titulo}
          </h1>

          <span style={{ 
            fontSize: '0.8rem',
            color: '#c8a24a', // 🔥 dourado aplicado com leveza
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {dash.categoria}
          </span>
        </div>
      </header>

      {/* IFRAME */}
      <div style={{ 
        flexGrow: 1, 
        position: 'relative', 
        backgroundColor: '#f9fafb' 
      }}>
        <iframe
          title={dash.titulo}
          src={dash.url_iframe}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          allowFullScreen={true}
        />
      </div>
    </div>
  );
}