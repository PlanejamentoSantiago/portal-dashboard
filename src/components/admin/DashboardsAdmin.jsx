import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, BarChart3, Save, Loader2, Copy, Check, ImageOff } from 'lucide-react';
import { supabase } from '../../SupabaseClient';

const ROLES = ['publico', 'bradesco_sa', 'bradesco_financiamentos', 'rcbitapeva_divzero', 'bsc', 'gerencia'];

const emptyForm = {
  titulo: '', url_iframe: '', permission_role: 'publico',
  descricao: '', ordem: 0, ativo: true,
};

const thumbSrc = (row) => row.image_url || `${import.meta.env.BASE_URL}thumbnails/${row.id}.png`;

// Miniatura com fallback pro ícone
function Thumb({ row }) {
  const [err, setErr] = useState(false);
  if (err || !row.id) return <BarChart3 size={18} />;
  return <img src={thumbSrc(row)} alt="" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />;
}

export default function DashboardsAdmin({ notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .order('permission_role', { ascending: true })
      .order('titulo', { ascending: true });
    if (error) notify('Erro ao carregar dashboards', true);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setCopied(false); setEditing({ ...emptyForm }); };
  const openEdit = (row) => { setCopied(false); setEditing({ ...emptyForm, ...row }); };

  const copyId = async () => {
    try { await navigator.clipboard.writeText(editing.id); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  const save = async () => {
    if (!editing.titulo.trim() || !editing.url_iframe.trim()) {
      notify('Título e link (URL) são obrigatórios', true);
      return;
    }
    setSaving(true);
    const payload = {
      titulo: editing.titulo.trim(),
      url_iframe: editing.url_iframe.trim(),
      permission_role: editing.permission_role.trim(),
      descricao: editing.descricao?.trim() || null,
      image_url: editing.image_url || null, // preserva valor existente, se houver
      ordem: Number(editing.ordem) || 0,
      ativo: !!editing.ativo,
    };
    let error, savedId = editing.id;
    if (editing.id) {
      ({ error } = await supabase.from('dashboards').update(payload).eq('id', editing.id));
    } else {
      const res = await supabase.from('dashboards').insert(payload).select('id').single();
      error = res.error;
      savedId = res.data?.id;
    }
    setSaving(false);
    if (error) { notify('Erro ao salvar: ' + error.message, true); return; }

    if (!editing.id && savedId) {
      // Recém-criado: mantém aberto em modo edição para exibir o ID da miniatura
      notify('Dashboard criado — veja abaixo o nome do arquivo da miniatura');
      setEditing({ ...editing, id: savedId });
      load();
      return;
    }
    notify('Dashboard atualizado');
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Remover o dashboard "${row.titulo}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('dashboards').delete().eq('id', row.id);
    if (error) { notify('Erro ao remover: ' + error.message, true); return; }
    notify('Dashboard removido');
    load();
  };

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 16 }}>
        <p className="page-sub" style={{ margin: 0 }}>{rows.length} dashboard(s) cadastrado(s)</p>
        <button className="btn btn--primary" onClick={openNew}><Plus size={17} /> Novo dashboard</button>
      </div>

      {loading ? (
        <div className="center-screen" style={{ height: '30vh' }}><div className="spinner" /></div>
      ) : (
        <div className="admin-list">
          {rows.map((row) => (
            <div className="admin-row" key={row.id}>
              <div className="admin-row__thumb"><Thumb row={row} /></div>
              <div className="admin-row__main">
                <div className="admin-row__title">{row.titulo}</div>
                <div className="admin-row__meta">
                  <span className="badge">{row.permission_role}</span>
                  <span className={`pill ${row.ativo !== false ? 'pill--on' : 'pill--off'}`}>{row.ativo !== false ? 'Ativo' : 'Inativo'}</span>
                  <span>ordem {row.ordem ?? 0}</span>
                </div>
              </div>
              <div className="admin-row__actions">
                <button className="icon-btn" onClick={() => openEdit(row)} title="Editar"><Pencil size={16} /></button>
                <button className="icon-btn icon-btn--danger" onClick={() => remove(row)} title="Remover"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="empty">Nenhum dashboard. Clique em "Novo dashboard".</div>}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3 className="modal__title">{editing.id ? 'Editar dashboard' : 'Novo dashboard'}</h3>
              <button className="modal__close" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="field">
                <label>Título *</label>
                <input type="text" value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} placeholder="Ex.: Bradesco Financiamentos" />
              </div>
              <div className="field">
                <label>Link do dashboard (URL do iframe) *</label>
                <input type="url" value={editing.url_iframe} onChange={(e) => setEditing({ ...editing, url_iframe: e.target.value })} placeholder="https://app.powerbi.com/view?r=..." />
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea value={editing.descricao || ''} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} placeholder="Breve descrição exibida no card e no carrossel" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Grupo / acesso</label>
                  <input list="roles-list" value={editing.permission_role} onChange={(e) => setEditing({ ...editing, permission_role: e.target.value })} />
                  <datalist id="roles-list">
                    {ROLES.map((r) => <option key={r} value={r} />)}
                  </datalist>
                  <div className="hint">"publico" fica visível a todos os usuários.</div>
                </div>
                <div className="field">
                  <label>Ordem</label>
                  <input type="number" value={editing.ordem} onChange={(e) => setEditing({ ...editing, ordem: e.target.value })} />
                </div>
              </div>

              {/* Miniatura — método local por ID (sem upload, preserva dados sensíveis) */}
              <div className="field">
                <label>Miniatura do dashboard</label>
                <div className="thumb-hint">
                  {editing.id ? (
                    <>
                      <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                        As miniaturas ficam na pasta local <code>public/thumbnails/</code> — <b>não vão para a nuvem</b>, preservando dados sensíveis.
                        Coloque a imagem lá com este nome exato:
                      </p>
                      <div className="idbox">
                        <code>{editing.id}.png</code>
                        <button type="button" className="btn btn--ghost" onClick={copyId} style={{ padding: '7px 12px' }}>
                          {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar ID</>}
                        </button>
                      </div>
                      <p className="hint" style={{ marginTop: 8 }}>Recomendado: 640 × 360 px (16:9). Após colocar o arquivo, faça o deploy para publicar.</p>
                    </>
                  ) : (
                    <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, color: '#475569' }}>
                      <ImageOff size={16} /> Salve o dashboard primeiro — o ID para nomear a imagem aparece aqui depois.
                    </p>
                  )}
                </div>
              </div>

              <label className="check">
                <input type="checkbox" checked={!!editing.ativo} onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })} />
                Ativo (visível no portal)
              </label>
            </div>
            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={() => setEditing(null)}>Fechar</button>
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
