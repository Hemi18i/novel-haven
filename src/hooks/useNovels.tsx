import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Novel {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  author: string | null;
  genre: string[] | null;
  status: string | null;
  is_official: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  novel_id: string;
  number: number;
  title: string;
  content_en: string | null;
  content_id: string | null;
  epub_en_url: string | null;
  epub_id_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNovels(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  return { novels, loading, error, refetch: fetchNovels };
}

export function useNovelDetails(id: string) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch novel
        const { data: novelData, error: novelError } = await supabase
          .from('novels')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (novelError) throw novelError;
        setNovel(novelData);

        // Fetch chapters
        if (novelData) {
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*')
            .eq('novel_id', id)
            .order('number', { ascending: true });

          if (chaptersError) throw chaptersError;
          setChapters(chaptersData || []);

          // Increment view count only once per session per novel
          const viewedKey = `novel_viewed_${id}`;
          const hasViewed = sessionStorage.getItem(viewedKey);
          
          if (!hasViewed) {
            await supabase
              .from('novels')
              .update({ view_count: (novelData.view_count || 0) + 1 })
              .eq('id', id);
            sessionStorage.setItem(viewedKey, 'true');
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return { novel, chapters, loading, error };
}
