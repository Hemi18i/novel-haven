import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('novel_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavoriteIds(data?.map(f => f.novel_id) || []);
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
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, novel_id: novelId });

        if (error) throw error;
        setFavoriteIds(prev => [...prev, novelId]);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      return { success: false, error: err.message };
    }
  }, [user, favoriteIds]);

  return { favoriteIds, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
}
