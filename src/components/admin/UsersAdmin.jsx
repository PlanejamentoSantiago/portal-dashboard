import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, UserRound, Mail, KeyRound } from 'lucide-react';
import { listUsers, createUser, updateUser, deleteUser } from '../../lib/adminUsers';

const ROLES = ['gerencia', 'bradesco_sa', 'bradesco_financiamentos', 'rcbitapeva_divzero', 'bsc', 'publico'];

const roleLabels = {
  gerencia: 'Gerência', bradesco_sa: 'Bradesco SA', bradesco_financiamentos: 'Bradesco Financiamentos',
  rcbitapeva_divzero: 'RCB Itapeva / DivZero', bsc: 'BSC', publico: 'Público',
};

const emptyForm = { id: null, email: '', nome: '', role: 'bradesco_financiamentos', password: '' };

export default function UsersAdmin({ notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { users } = await listUsers();
      setRows(users || []);
      setUnavailable(false);
    } catch (e) {
      console.error(e);
      setUnavailable(true);
      notify('Não foi possível carregar usuários: ' + e.message, true);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({ ...emptyForm });
  const openEdit = (row) => setEditing({ id: row.id, email: row.email, nome: row.nome || '', role: row.role || 'publico', password: '' });

  const save = async () => {
    if (!editing.id && (!editing.email.trim() || !editing.password)) {
      notify('E-mail e senha são obrigatórios para criar', true); return;
    }
    if (!editing.role) { notify('Escolha um grupo', true); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await updateUser({ id: editing.id, role: editing.role, nome: editing.nome, password: editing.password || undefined });
        notify('Usuário atualizado');
      } else {
        await createUser({ email: editing.email.trim(), password: editing.password, role: editing.role, nome: editing.nome });
        notify('Usuário criado');
      }
      setEditing(null);
      load();
    } catch (e) {
      notify('Erro: ' + e.message, true);
    }
    setSaving(false);
  };

  const remove = async (row) => {
    if (!confirm(`Remover o usuário "${row.email}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteUser(row.id);
      notify('Usuário removido');
      load();
    } catch (e) {
      notify('Erro ao remover: ' + e.message, true);
    }
  };

  if (unavailable && !loading) {
    return (
      <div className="empty">
        <UserRound size={40} color="#153d7a" />
        <h3 style={{ marginTop: 12 }}>Gestão de usuários indisponível</h3>
        <p style={{ maxWidth: 460, margin: '8px auto 0' }}>
          A função <code>admin-users</code> ainda não foi publicada no Supabase, ou você não tem permissão.
          Faça o deploy da Edge Function para habilitar esta aba.
        </p>
        <button className="btn btn--ghost" style={{ marginTop: 16 }} onClick={load}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 16 }}>
        <p className="page-sub" style={{ margin: 0 }}>{rows.length} usuário(s)</p>
        <button className="btn btn--primary" onClick={openNew}><Plus size={17} /> Novo usuário</button>
      </div>

      {loading ? (
        <div className="center-screen" style={{ height: '30vh' }}><div className="spinner" /></div>
      ) : (
        <div className="admin-list">
          {rows.map((row) => (
            <div className="admin-row" key={row.id}>
              <div className="admin-row__thumb" style={{ borderRadius: '50%', width: 40 }}>
                {(row.nome || row.email || '?').trim().slice(0, 2).toUpperCase()}
              </div>
              <div className="admin-row__main">
                <div className="admin-row__title">{row.nome || row.email}</div>
                <div className="admin-row__meta">
                  <span>{row.email}</span>
                  <span className="badge">{roleLabels[row.role] || row.role || '—'}</span>
                  {row.last_sign_in_at && <span>último acesso {new Date(row.last_sign_in_at).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <div className="admin-row__actions">
                <button className="icon-btn" onClick={() => openEdit(row)} title="Editar"><Pencil size={16} /></button>
                <button className="icon-btn icon-btn--danger" onClick={() => remove(row)} title="Remover"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="empty">Nenhum usuário. Clique em "Novo usuário".</div>}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3 className="modal__title">{editing.id ? 'Editar usuário' : 'Novo usuário'}</h3>
              <button className="modal__close" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="field">
                <label>Nome</label>
                <input type="text" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Nome de exibição" />
              </div>
              <div className="field">
                <label>E-mail {editing.id ? '' : '*'}</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                  disabled={!!editing.id}
                />
                {editing.id && <div className="hint">O e-mail de login não pode ser alterado por aqui.</div>}
              </div>
              <div className="field">
                <label>Grupo / acesso *</label>
                <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r] || r}</option>)}
                </select>
              </div>
              <div className="field">
                <label>{editing.id ? 'Nova senha (opcional)' : 'Senha *'}</label>
                <input
                  type="text"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  placeholder={editing.id ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                />
                {editing.id && <div className="hint">Preencha apenas se quiser redefinir a senha do usuário.</div>}
              </div>
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
