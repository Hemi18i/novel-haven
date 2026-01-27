import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, X, Book, Upload, FileText, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StarBackground } from '@/components/StarBackground';

interface Novel {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  author: string | null;
  genre: string[] | null;
  status: string | null;
  is_official: boolean;
}

interface Chapter {
  id: string;
  novel_id: string;
  number: number;
  title: string;
  content_en: string | null;
  content_id: string | null;
  epub_en_url: string | null;
  epub_id_url: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNovel, setIsAddingNovel] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingEpub, setUploadingEpub] = useState<{ novelId: string; lang: 'en' | 'id' } | null>(null);

  const [newNovel, setNewNovel] = useState({
    title: '',
    cover_url: '',
    description: '',
    author: '',
    genre: '',
    is_official: false,
  });

  const [newChapter, setNewChapter] = useState({
    number: 1,
    title: '',
    contentEn: '',
    contentId: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNovels(data || []);
    } catch (err) {
      console.error('Error fetching novels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `covers/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('novels')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('novels')
        .getPublicUrl(fileName);

      setNewNovel({ ...newNovel, cover_url: publicUrl });
    } catch (err) {
      console.error('Error uploading cover:', err);
      alert('Error uploading cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAddNovel = async () => {
    try {
      const { error } = await supabase.from('novels').insert({
        title: newNovel.title,
        cover_url: newNovel.cover_url || null,
        description: newNovel.description || null,
        author: newNovel.author || null,
        genre: newNovel.genre.split(',').map((g) => g.trim()).filter(Boolean),
        is_official: newNovel.is_official,
        status: 'ongoing',
      });

      if (error) throw error;

      setNewNovel({
        title: '',
        cover_url: '',
        description: '',
        author: '',
        genre: '',
        is_official: false,
      });
      setIsAddingNovel(false);
      fetchNovels();
    } catch (err) {
      console.error('Error adding novel:', err);
      alert('Error adding novel');
    }
  };

  const handleEpubUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    novelId: string,
    chapterNumber: number,
    lang: 'en' | 'id'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEpub({ novelId, lang });
    try {
      const fileName = `epub/${novelId}/${chapterNumber}_${lang}.epub`;

      const { error: uploadError } = await supabase.storage
        .from('novels')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('novels')
        .getPublicUrl(fileName);

      // Update chapter with epub URL
      const updateField = lang === 'en' ? 'epub_en_url' : 'epub_id_url';
      await supabase
        .from('chapters')
        .update({ [updateField]: publicUrl })
        .eq('novel_id', novelId)
        .eq('number', chapterNumber);

      alert(`EPUB ${lang.toUpperCase()} uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading EPUB:', err);
      alert('Error uploading EPUB');
    } finally {
      setUploadingEpub(null);
    }
  };

  const handleAddChapter = async (novelId: string) => {
    try {
      const { error } = await supabase.from('chapters').insert({
        novel_id: novelId,
        number: newChapter.number,
        title: newChapter.title,
        content_en: newChapter.contentEn || null,
        content_id: newChapter.contentId || null,
      });

      if (error) throw error;

      setNewChapter({
        number: newChapter.number + 1,
        title: '',
        contentEn: '',
        contentId: '',
      });
      setShowChapterForm(null);
      alert('Chapter added successfully!');
    } catch (err) {
      console.error('Error adding chapter:', err);
      alert('Error adding chapter');
    }
  };

  const handleDeleteNovel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this novel?')) return;

    try {
      const { error } = await supabase.from('novels').delete().eq('id', id);
      if (error) throw error;
      fetchNovels();
    } catch (err) {
      console.error('Error deleting novel:', err);
      alert('Error deleting novel');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Access Denied - Admin Only</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="ml-2 font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingNovel(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Novel
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* Add Novel Form */}
          {isAddingNovel && (
            <div className="bg-card border border-border rounded-xl p-4 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Add New Novel</h2>
                <button
                  onClick={() => setIsAddingNovel(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={newNovel.title}
                  onChange={(e) => setNewNovel({ ...newNovel, title: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {/* Cover Upload */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cover URL (or upload)"
                    value={newNovel.cover_url}
                    onChange={(e) => setNewNovel({ ...newNovel, cover_url: e.target.value })}
                    className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="flex items-center justify-center px-4 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-secondary/80">
                    {uploadingCover ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Author"
                  value={newNovel.author}
                  onChange={(e) => setNewNovel({ ...newNovel, author: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Genre (comma separated)"
                  value={newNovel.genre}
                  onChange={(e) => setNewNovel({ ...newNovel, genre: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Description"
                  value={newNovel.description}
                  onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNovel.is_official}
                    onChange={(e) => setNewNovel({ ...newNovel, is_official: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Official Series</span>
                </label>
                <button
                  onClick={handleAddNovel}
                  disabled={!newNovel.title}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
                >
                  Add Novel
                </button>
              </div>
            </div>
          )}

          {/* Novel List */}
          <div className="space-y-4">
            {novels.map((novel) => (
              <div key={novel.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex gap-3">
                  <img
                    src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                    alt={novel.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{novel.title}</h3>
                    <p className="text-sm text-muted-foreground">{novel.author}</p>
                    {novel.is_official && (
                      <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs rounded mt-1">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowChapterForm(showChapterForm === novel.id ? null : novel.id)}
                      className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30"
                      title="Add Chapter"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNovel(novel.id)}
                      className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30"
                      title="Delete Novel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add Chapter Form */}
                {showChapterForm === novel.id && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Add Chapter
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Chapter #"
                          value={newChapter.number}
                          onChange={(e) =>
                            setNewChapter({ ...newChapter, number: parseInt(e.target.value) || 1 })
                          }
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={newChapter.title}
                          onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Content (English)</label>
                        <textarea
                          placeholder="Content (English)"
                          value={newChapter.contentEn}
                          onChange={(e) => setNewChapter({ ...newChapter, contentEn: e.target.value })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Content (Indonesian)</label>
                        <textarea
                          placeholder="Content (Indonesian)"
                          value={newChapter.contentId}
                          onChange={(e) => setNewChapter({ ...newChapter, contentId: e.target.value })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                        />
                      </div>

                      {/* EPUB Upload Section */}
                      <div className="border border-border rounded-lg p-3 bg-secondary/30">
                        <h5 className="text-xs font-semibold mb-2 text-muted-foreground">Upload EPUB Files (Optional)</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-secondary/80 text-sm">
                            {uploadingEpub?.novelId === novel.id && uploadingEpub?.lang === 'en' ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>EPUB (EN)</span>
                            <input
                              type="file"
                              accept=".epub"
                              onChange={(e) => handleEpubUpload(e, novel.id, newChapter.number, 'en')}
                              className="hidden"
                            />
                          </label>
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-secondary/80 text-sm">
                            {uploadingEpub?.novelId === novel.id && uploadingEpub?.lang === 'id' ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>EPUB (ID)</span>
                            <input
                              type="file"
                              accept=".epub"
                              onChange={(e) => handleEpubUpload(e, novel.id, newChapter.number, 'id')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddChapter(novel.id)}
                        disabled={!newChapter.title}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Chapter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {novels.length === 0 && !isAddingNovel && (
            <div className="text-center py-12 text-muted-foreground">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No novels yet. Add your first novel!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
