import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Novel = Tables<'novels'>;

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('novel_id, novels(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFavoriteIds(data?.map(f => f.novel_id) || []);
      setFavorites(data?.map(f => f.novels).filter(Boolean) as Novel[] || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((novelId: string) => {
    return favoriteIds.includes(novelId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (novelId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const isCurrentlyFavorite = favoriteIds.includes(novelId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('novel_id', novelId);

        if (error) throw error;
        setFavoriteIds(prev => prev.filter(id => id !== novelId));
        setFavorites(prev => prev.filter(n => n.id !== novelId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, novel_id: novelId });

        if (error) throw error;
        setFavoriteIds(prev => [...prev, novelId]);
        // Refetch to get the novel data
        fetchFavorites();
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      return { success: false, error: err.message };
    }
  }, [user, favoriteIds, fetchFavorites]);

  return { favoriteIds, favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
}
