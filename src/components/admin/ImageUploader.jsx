import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../lib/upload';

/**
 * Campo de upload de imagem para o Storage.
 * props: value (url), onChange(url), folder, hint
 */
export default function ImageUploader({ value, onChange, folder = 'misc', hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e2) {
      console.error(e2);
      setErr('Falha no upload: ' + (e2.message || 'erro'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="field">
      <label>Imagem</label>
      <div className="uploader">
        <div className="uploader__preview">
          {value ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <ImageIcon size={22} />}
        </div>
        <div className="uploader__btns">
          <button type="button" className="btn btn--ghost" onClick={pick} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {busy ? 'Enviando...' : value ? 'Trocar imagem' : 'Enviar imagem'}
          </button>
          {value && (
            <button type="button" className="btn btn--danger" onClick={() => onChange('')} disabled={busy}>
              Remover
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {hint && <div className="hint">{hint}</div>}
      {err && <div className="hint" style={{ color: '#dc2626' }}>{err}</div>}
    </div>
  );
}
