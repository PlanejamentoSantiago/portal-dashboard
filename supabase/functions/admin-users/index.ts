// Edge Function: admin-users
// Gestão de usuários do portal (somente para o perfil "gerencia").
// Ações: list | create | update | delete
//
// Segurança:
//  - Usa a SERVICE_ROLE_KEY (nunca exposta ao front).
//  - Valida o JWT do chamador e confere se o perfil dele é "gerencia".

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // 1) Identifica o chamador pelo JWT
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json({ error: 'Sem token' }, 401);

    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Não autenticado' }, 401);

    // 2) Confere se é gerência
    const { data: perfil } = await admin
      .from('perfis')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!perfil || String(perfil.role || '').trim().toLowerCase() !== 'gerencia') {
      return json({ error: 'Acesso restrito à gerência' }, 403);
    }

    // 3) Executa a ação
    const { action, payload } = await req.json();

    switch (action) {
      case 'list': {
        const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) return json({ error: error.message }, 400);

        const { data: perfis } = await admin.from('perfis').select('id, role, nome');
        const byId = new Map((perfis || []).map((p) => [p.id, p]));

        const users = list.users.map((u) => ({
          id: u.id,
          email: u.email,
          nome: byId.get(u.id)?.nome || '',
          role: byId.get(u.id)?.role || '',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        }));
        return json({ users });
      }

      case 'create': {
        const { email, password, role, nome } = payload || {};
        if (!email || !password || !role) return json({ error: 'email, senha e grupo são obrigatórios' }, 400);

        const { data: created, error } = await admin.auth.admin.createUser({
          email, password, email_confirm: true,
        });
        if (error) return json({ error: error.message }, 400);

        const { error: pErr } = await admin.from('perfis').upsert({
          id: created.user.id, role, nome: nome || null, email,
        });
        if (pErr) return json({ error: 'Usuário criado, mas falhou ao salvar o perfil: ' + pErr.message }, 400);

        return json({ ok: true, id: created.user.id });
      }

      case 'update': {
        const { id, role, nome, password } = payload || {};
        if (!id) return json({ error: 'id é obrigatório' }, 400);

        const perfilUpdate: Record<string, unknown> = {};
        if (role !== undefined) perfilUpdate.role = role;
        if (nome !== undefined) perfilUpdate.nome = nome || null;
        if (Object.keys(perfilUpdate).length) {
          const { error } = await admin.from('perfis').update(perfilUpdate).eq('id', id);
          if (error) return json({ error: error.message }, 400);
        }
        if (password) {
          const { error } = await admin.auth.admin.updateUserById(id, { password });
          if (error) return json({ error: error.message }, 400);
        }
        return json({ ok: true });
      }

      case 'delete': {
        const { id } = payload || {};
        if (!id) return json({ error: 'id é obrigatório' }, 400);
        if (id === userData.user.id) return json({ error: 'Você não pode remover a si mesmo' }, 400);

        await admin.from('perfis').delete().eq('id', id);
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      default:
        return json({ error: 'Ação inválida' }, 400);
    }
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
