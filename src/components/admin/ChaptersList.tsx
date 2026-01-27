import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Chapter {
  id: string;
  number: number;
  title: string;
  content_en: string | null;
  content_id: string | null;
}

interface ChaptersListProps {
  novelId: string;
  refreshTrigger: number;
}

export function ChaptersList({ novelId, refreshTrigger }: ChaptersListProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editContent, setEditContent] = useState({ title: '', content_en: '', content_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, [novelId, refreshTrigger]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, number, title, content_en, content_id')
        .eq('novel_id', novelId)
        .order('number', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setEditContent({
      title: chapter.title,
      content_en: chapter.content_en || '',
      content_id: chapter.content_id || '',
    });
    setExpandedChapter(chapter.id);
  };

  const handleSave = async (chapterId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: editContent.title,
          content_en: editContent.content_en || null,
          content_id: editContent.content_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapterId);

      if (error) throw error;
      
      setEditingChapter(null);
      fetchChapters();
    } catch (err) {
      console.error('Error saving chapter:', err);
      alert('Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
      fetchChapters();
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert('Failed to delete chapter');
    }
  };

  const getContentPreview = (content: string | null): string => {
    if (!content) return 'No content';
    // Strip HTML tags for preview
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Loading chapters...
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No chapters yet. Import an EPUB or add chapters manually.
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Chapters ({chapters.length})
      </h4>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="border border-border rounded-lg overflow-hidden">
            {/* Chapter Header */}
            <div 
              className="flex items-center gap-2 p-3 bg-secondary/30 cursor-pointer hover:bg-secondary/50"
              onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
            >
              <span className="text-xs font-mono text-muted-foreground w-8">
                #{chapter.number}
              </span>
              <span className="flex-1 text-sm font-medium truncate">
                {chapter.title}
              </span>
              <div className="flex items-center gap-1">
                {chapter.content_en && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">EN</span>
                )}
                {chapter.content_id && (
                  <span className="text-xs px-1.5 py-0.5 bg-accent/50 text-accent-foreground rounded">ID</span>
                )}
              </div>
              {expandedChapter === chapter.id ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Expanded Content */}
            {expandedChapter === chapter.id && (
              <div className="p-3 space-y-3 border-t border-border">
                {editingChapter === chapter.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editContent.title}
                      onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                      placeholder="Chapter title"
                    />
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">English Content</label>
                      <textarea
                        value={editContent.content_en}
                        onChange={(e) => setEditContent({ ...editContent, content_en: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[150px] font-mono text-xs"
                        placeholder="HTML content (English)"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Indonesian Content</label>
                      <textarea
                        value={editContent.content_id}
                        onChange={(e) => setEditContent({ ...editContent, content_id: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[150px] font-mono text-xs"
                        placeholder="HTML content (Indonesian)"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(chapter.id)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingChapter(null)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-3">
                    {chapter.content_en && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">English</label>
                        <p className="text-sm text-foreground/80 bg-secondary/50 p-2 rounded">
                          {getContentPreview(chapter.content_en)}
                        </p>
                      </div>
                    )}
                    {chapter.content_id && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Indonesian</label>
                        <p className="text-sm text-foreground/80 bg-secondary/50 p-2 rounded">
                          {getContentPreview(chapter.content_id)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(chapter)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(chapter.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg text-sm hover:bg-destructive/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
