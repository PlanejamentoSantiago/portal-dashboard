import { X, Rocket } from 'lucide-react';
import { CHANGELOG } from '../changelog';

export default function ChangelogModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rocket size={20} color="#153d7a" /> Novidades e melhorias
          </h3>
          <button className="modal__close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          {CHANGELOG.map((entry, i) => (
            <div className="cl-entry" key={entry.version}>
              <div className="cl-ver">
                <b>v{entry.version}</b>
                {i === 0 && <span className="cl-tag">ATUAL</span>}
                <span style={{ color: '#64748b', fontSize: 13.5 }}>· {entry.title}</span>
              </div>
              <div className="cl-date">{new Date(entry.date).toLocaleDateString('pt-BR')}</div>
              <ul className="cl-items">
                {entry.items.map((it, k) => (
                  <li key={k}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
