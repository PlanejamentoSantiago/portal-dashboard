import { supabase } from '../SupabaseClient';

/**
 * Chama a Edge Function admin-users. O token do usuário logado é
 * enviado automaticamente pelo supabase-js (Authorization).
 */
async function call(action, payload) {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action, payload },
  });
  if (error) {
    // Tenta extrair a mensagem retornada pela function
    let msg = error.message;
    try { msg = (await error.context?.json())?.error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const listUsers = () => call('list');
export const createUser = (payload) => call('create', payload);
export const updateUser = (payload) => call('update', payload);
export const deleteUser = (id) => call('delete', { id });
