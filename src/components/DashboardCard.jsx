import { useState } from 'react';
import { BarChart3, Star, ExternalLink } from 'lucide-react';
import { brandFor, backgroundFor } from '../lib/brands';

/**
 * Card de dashboard.
 * props: dashboard, isFavorite, onToggleFavorite, onOpen
 */
export default function DashboardCard({ dashboard, isFavorite, onToggleFavorite, onOpen }) {
  const [imgError, setImgError] = useState(false);
  const [bgError, setBgError] = useState(false);

  // Prioridade: miniatura própria (image_url ou {uuid}.png) -> background do grupo -> ícone
  const legacy = `${import.meta.env.BASE_URL}thumbnails/${dashboard.id}.png`;
  const src = dashboard.image_url || legacy;
  const background = backgroundFor(dashboard.permission_role);

  const role = String(dashboard.permission_role || '').toLowerCase();
  const isPublic = role === 'publico';
  const brand = brandFor(dashboard.permission_role);

  return (
    <div className="card" onClick={() => onOpen(dashboard)}>
      <div className="card__thumb">
        {!imgError ? (
          <img src={src} alt={dashboard.titulo} onError={() => setImgError(true)} />
        ) : !bgError ? (
          <img src={background} alt={dashboard.titulo} onError={() => setBgError(true)} />
        ) : (
          <BarChart3 size={44} className="card__thumb-fallback" />
        )}

        {onToggleFavorite && (
          <button
            className={`card__fav ${isFavorite ? 'is-fav' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dashboard.id);
            }}
            aria-label="Favoritar"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star size={17} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">{dashboard.titulo}</h3>
        {dashboard.descricao && <p className="card__desc">{dashboard.descricao}</p>}

        <div className="card__foot">
          <span className={`badge ${brand ? 'badge--brand' : isPublic ? 'badge--publico' : ''}`}>
            {brand && <img className="badge__logo" src={brand} alt="" />}
            {dashboard.permission_role}
          </span>
          <button className="btn-open" onClick={(e) => { e.stopPropagation(); onOpen(dashboard); }}>
            Abrir <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
