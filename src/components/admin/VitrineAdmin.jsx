import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../SupabaseClient';
import ImageUploader from './ImageUploader';

const emptyForm = {
  titulo: '', subtitulo: '', image_url: '', badge: '',
  destino: 'nenhum', dashboard_id: '', link_externo: '',
  ordem: 0, ativo: true,
};

const badgeLabel = { novo: 'NOVO', destaque: 'DESTAQUE' };

export default function VitrineAdmin({ notify }) {
  const [rows, setRows] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: v }, { data: d }] = await Promise.all([
      supabase.from('vitrine').select('*').order('ordem', { ascending: true }),
      supabase.from('dashboards').select('id, titulo').order('titulo'),
    ]);
    setRows(v || []);
    setDashboards(d || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({ ...emptyForm });
  const openEdit = (row) => setEditing({
    ...emptyForm, ...row,
    badge: row.badge || '',
    destino: row.link_externo ? 'link' : row.dashboard_id ? 'dashboard' : 'nenhum',
    dashboard_id: row.dashboard_id || '',
    link_externo: row.link_externo || '',
  });

  const save = async () => {
    if (!editing.titulo.trim()) { notify('O título é obrigatório', true); return; }
    setSaving(true);
    const payload = {
      titulo: editing.titulo.trim(),
      subtitulo: editing.subtitulo?.trim() || null,
      image_url: editing.image_url || null,
      badge: editing.badge || null,
      dashboard_id: editing.destino === 'dashboard' ? (editing.dashboard_id || null) : null,
      link_externo: editing.destino === 'link' ? (editing.link_externo?.trim() || null) : null,
      ordem: Number(editing.ordem) || 0,
      ativo: !!editing.ativo,
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from('vitrine').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('vitrine').insert(payload));
    }
    setSaving(false);
    if (error) { notify('Erro ao salvar: ' + error.message, true); return; }
    notify(editing.id ? 'Slide atualizado' : 'Slide criado');
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Remover o slide "${row.titulo}"?`)) return;
    const { error } = await supabase.from('vitrine').delete().eq('id', row.id);
    if (error) { notify('Erro ao remover: ' + error.message, true); return; }
    notify('Slide removido');
    load();
  };

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 16 }}>
        <p className="page-sub" style={{ margin: 0 }}>{rows.length} slide(s) na vitrine</p>
        <button className="btn btn--primary" onClick={openNew}><Plus size={17} /> Novo slide</button>
      </div>

      {loading ? (
        <div className="center-screen" style={{ height: '30vh' }}><div className="spinner" /></div>
      ) : (
        <div className="admin-list">
          {rows.map((row) => (
            <div className="admin-row" key={row.id}>
              <div className="admin-row__thumb">
                {row.image_url ? <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <ImageIcon size={18} />}
              </div>
              <div className="admin-row__main">
                <div className="admin-row__title">{row.titulo}</div>
                <div className="admin-row__meta">
                  {row.badge && <span className="badge">{badgeLabel[row.badge] || row.badge}</span>}
                  <span className={`pill ${row.ativo !== false ? 'pill--on' : 'pill--off'}`}>{row.ativo !== false ? 'Ativo' : 'Inativo'}</span>
                  <span>{row.link_externo ? 'Link externo' : row.dashboard_id ? 'Abre dashboard' : 'Campanha (sem botão)'}</span>
                  <span>ordem {row.ordem ?? 0}</span>
                </div>
              </div>
              <div className="admin-row__actions">
                <button className="icon-btn" onClick={() => openEdit(row)} title="Editar"><Pencil size={16} /></button>
                <button className="icon-btn icon-btn--danger" onClick={() => remove(row)} title="Remover"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="empty">Nenhum slide na vitrine. Clique em "Novo slide".</div>}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3 className="modal__title">{editing.id ? 'Editar slide' : 'Novo slide'}</h3>
              <button className="modal__close" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="field">
                <label>Título *</label>
                <input type="text" value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} placeholder="Ex.: Novo painel de Produção disponível" />
              </div>
              <div className="field">
                <label>Subtítulo</label>
                <textarea value={editing.subtitulo || ''} onChange={(e) => setEditing({ ...editing, subtitulo: e.target.value })} placeholder="Texto de apoio exibido sobre a imagem" />
              </div>

              <ImageUploader
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="vitrine"
                hint="Imagem do carrossel. Tamanho ideal: 1600 × 420 px (proporção ~3,8:1), até 2 MB. Em slides de campanha (sem destino), a imagem aparece inteira, sem texto por cima — capriche na arte já com título/selo embutidos."
              />

              <div className="field-row">
                <div className="field">
                  <label>Selo</label>
                  <select value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })}>
                    <option value="">Nenhum</option>
                    <option value="novo">Novo</option>
                    <option value="destaque">Destaque</option>
                  </select>
                </div>
                <div className="field">
                  <label>Ordem</label>
                  <input type="number" value={editing.ordem} onChange={(e) => setEditing({ ...editing, ordem: e.target.value })} />
                </div>
              </div>

              <div className="field">
                <label>Ao clicar no slide</label>
                <select value={editing.destino} onChange={(e) => setEditing({ ...editing, destino: e.target.value })}>
                  <option value="nenhum">Nada — apenas imagem/campanha (sem botão)</option>
                  <option value="dashboard">Abrir um dashboard</option>
                  <option value="link">Abrir um link externo</option>
                </select>
              </div>

              {editing.destino === 'dashboard' && (
                <div className="field">
                  <label>Dashboard de destino</label>
                  <select value={editing.dashboard_id} onChange={(e) => setEditing({ ...editing, dashboard_id: e.target.value })}>
                    <option value="">Selecione...</option>
                    {dashboards.map((d) => <option key={d.id} value={d.id}>{d.titulo}</option>)}
                  </select>
                </div>
              )}

              {editing.destino === 'link' && (
                <div className="field">
                  <label>Link externo</label>
                  <input type="url" value={editing.link_externo} onChange={(e) => setEditing({ ...editing, link_externo: e.target.value })} placeholder="https://..." />
                </div>
              )}

              <label className="check">
                <input type="checkbox" checked={!!editing.ativo} onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })} />
                Ativo (exibir no carrossel)
              </label>
            </div>
            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
