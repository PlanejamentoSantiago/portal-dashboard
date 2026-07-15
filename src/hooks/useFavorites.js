import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../context/AuthContext';

/**
 * Gerencia os favoritos do usuário logado.
 * Degrada com elegância caso a tabela `favoritos` ainda não exista.
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('favoritos')
      .select('dashboard_id')
      .eq('user_id', user.id);

    if (error) {
      console.warn('Favoritos indisponíveis:', error.message);
      setFavorites(new Set());
    } else {
      setFavorites(new Set((data || []).map((f) => String(f.dashboard_id))));
    }
    setReady(true);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback(
    (dashboardId) => favorites.has(String(dashboardId)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (dashboardId) => {
      if (!user) return;
      const key = String(dashboardId);
      const already = favorites.has(key);

      // otimista
      setFavorites((prev) => {
        const next = new Set(prev);
        already ? next.delete(key) : next.add(key);
        return next;
      });

      if (already) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('dashboard_id', dashboardId);
        if (error) load(); // reverte
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({ user_id: user.id, dashboard_id: dashboardId });
        if (error) load(); // reverte
      }
    },
    [user, favorites, load]
  );

  return { favorites, isFavorite, toggleFavorite, ready, reload: load };
}
