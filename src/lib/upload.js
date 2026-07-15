import { supabase } from '../SupabaseClient';

const BUCKET = 'bi-assets';

/**
 * Faz upload de uma imagem para o bucket bi-assets e retorna a URL pública.
 * @param {File} file
 * @param {string} folder  ex.: 'dashboards' | 'vitrine'
 */
export async function uploadImage(file, folder = 'misc') {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const name = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return data.publicUrl;
}
