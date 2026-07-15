import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Star } from 'lucide-react';

const BADGES = {
  novo: { label: 'Novo', icon: Sparkles, cls: 'slide__badge--novo' },
  destaque: { label: 'Destaque', icon: Star, cls: 'slide__badge--destaque' },
};

/**
 * Carrossel da vitrine da home.
 * slides: [{ id, titulo, subtitulo, image_url, badge, ctaLabel, onAction }]
 * - badge: 'novo' | 'destaque' | null
 * - onAction ausente => slide de campanha (sem botão de abrir)
 */
export default function ShowcaseCarousel({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);
  const count = slides.length;

  const go = (i) => setIndex((i + count) % count);
  const start = () => {
    if (count > 1) timer.current = setInterval(() => setIndex((p) => (p + 1) % count), 15000);
  };
  const pause = () => timer.current && clearInterval(timer.current);

  useEffect(() => {
    start();
    return pause;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="carousel" onMouseEnter={pause} onMouseLeave={start}>
      <div className="carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s) => {
          const badge = BADGES[s.badge];
          // Campanha: imagem sem destino => mostra só a imagem, limpa (sem overlay/texto)
          const imageOnly = !!s.image_url && !s.onAction;

          if (imageOnly) {
            return (
              <div className="slide slide--image" key={s.id}>
                <img className="slide__img" src={s.image_url} alt={s.titulo || 'Campanha'} />
              </div>
            );
          }

          return (
            <div className="slide" key={s.id}>
              {s.image_url ? (
                <img
                  className="slide__img"
                  src={s.image_url}
                  alt={s.titulo}
                  onError={(e) => {
                    if (s.fallback && e.currentTarget.src !== s.fallback) e.currentTarget.src = s.fallback;
                  }}
                />
              ) : (
                <div className="slide__img" style={{ background: 'linear-gradient(120deg, #153d7a, #0f2c57)' }} />
              )}
              <div className="slide__overlay" />
              <div className="slide__body">
                {badge && (
                  <span className={`slide__badge ${badge.cls}`}>
                    <badge.icon size={13} /> {badge.label}
                  </span>
                )}
                <h2 className="slide__title">{s.titulo}</h2>
                {s.subtitulo && <p className="slide__desc">{s.subtitulo}</p>}
                {s.onAction && (
                  <button className="btn btn--gold" onClick={s.onAction}>
                    {s.ctaLabel || 'Abrir'} <ExternalLink size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button className="carousel__nav carousel__nav--prev" onClick={() => go(index - 1)} aria-label="Anterior">
            <ChevronLeft size={22} />
          </button>
          <button className="carousel__nav carousel__nav--next" onClick={() => go(index + 1)} aria-label="Próximo">
            <ChevronRight size={22} />
          </button>
          <div className="carousel__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
