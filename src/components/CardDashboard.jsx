import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CardDashboard({ dashboard }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const imagePath = `${import.meta.env.BASE_URL}thumbnails/${dashboard.id}.png`;

  return (
    <div 
      style={{
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden'
      }}
      onClick={() => navigate(`/dashboard/${dashboard.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
    >

      {/* IMAGEM / FALLBACK */}
      <div style={{ 
        height: '140px',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!imgError ? (
          <img
            src={imagePath}
            alt={dashboard.titulo}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span style={{ fontSize: '40px' }}>📊</span>
        )}
      </div>

      {/* CONTEÚDO */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
          {dashboard.titulo}
        </h3>

        <span style={{ 
          fontSize: '12px', 
          backgroundColor: '#e2e8f0', 
          padding: '4px 10px', 
          borderRadius: '999px',
          color: '#475569',
          fontWeight: '600'
        }}>
          {dashboard.permission_role} 
        </span>
      </div>

    </div>
  );
}