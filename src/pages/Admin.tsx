import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Book } from 'lucide-react';
import { useNovelStore } from '@/stores/novelStore';
import { Novel, Chapter } from '@/types/novel';
import { StarBackground } from '@/components/StarBackground';

const Admin = () => {
  const navigate = useNavigate();
  const { novels, addNovel, updateNovel, deleteNovel } = useNovelStore();
  
  const [isAddingNovel, setIsAddingNovel] = useState(false);
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);
  const [newNovel, setNewNovel] = useState({
    title: '',
    cover: '',
    description: '',
    author: '',
    genre: '',
    languages: ['en'] as ('en' | 'id')[],
  });
  const [newChapter, setNewChapter] = useState({
    novelId: '',
    number: 1,
    title: '',
    contentEn: '',
    contentId: '',
  });
  const [showChapterForm, setShowChapterForm] = useState<string | null>(null);

  const handleAddNovel = () => {
    const novel: Novel = {
      id: Date.now().toString(),
      title: newNovel.title,
      cover: newNovel.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      description: newNovel.description,
      author: newNovel.author,
      genre: newNovel.genre.split(',').map((g) => g.trim()).filter(Boolean),
      status: 'ongoing',
      languages: newNovel.languages,
      chapters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addNovel(novel);
    setNewNovel({
      title: '',
      cover: '',
      description: '',
      author: '',
      genre: '',
      languages: ['en'],
    });
    setIsAddingNovel(false);
  };

  const handleAddChapter = (novelId: string) => {
    const novel = novels.find((n) => n.id === novelId);
    if (!novel) return;

    const chapter: Chapter = {
      id: `${novelId}-${newChapter.number}`,
      number: newChapter.number,
      title: newChapter.title,
      content: {
        en: newChapter.contentEn,
        id: newChapter.contentId || undefined,
      },
    };

    updateNovel(novelId, {
      chapters: [...novel.chapters, chapter],
      updatedAt: new Date(),
    });

    setNewChapter({
      novelId: '',
      number: novel.chapters.length + 2,
      title: '',
      contentEn: '',
      contentId: '',
    });
    setShowChapterForm(null);
  };

  const handleDeleteNovel = (id: string) => {
    if (window.confirm('Are you sure you want to delete this novel?')) {
      deleteNovel(id);
    }
  };

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
            <button
              onClick={() => setIsAddingNovel(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Novel
            </button>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* Add Novel Form */}
          {isAddingNovel && (
            <div className="admin-card mb-6 animate-fade-in">
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
                  className="admin-input"
                />
                <input
                  type="text"
                  placeholder="Cover URL (optional)"
                  value={newNovel.cover}
                  onChange={(e) => setNewNovel({ ...newNovel, cover: e.target.value })}
                  className="admin-input"
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={newNovel.author}
                  onChange={(e) => setNewNovel({ ...newNovel, author: e.target.value })}
                  className="admin-input"
                />
                <input
                  type="text"
                  placeholder="Genre (comma separated)"
                  value={newNovel.genre}
                  onChange={(e) => setNewNovel({ ...newNovel, genre: e.target.value })}
                  className="admin-input"
                />
                <textarea
                  placeholder="Description"
                  value={newNovel.description}
                  onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
                  className="admin-input min-h-[80px]"
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newNovel.languages.includes('en')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewNovel({ ...newNovel, languages: [...newNovel.languages, 'en'] });
                        } else {
                          setNewNovel({ ...newNovel, languages: newNovel.languages.filter((l) => l !== 'en') });
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm">🇬🇧 English</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newNovel.languages.includes('id')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewNovel({ ...newNovel, languages: [...newNovel.languages, 'id'] });
                        } else {
                          setNewNovel({ ...newNovel, languages: newNovel.languages.filter((l) => l !== 'id') });
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm">🇮🇩 Indonesia</span>
                  </label>
                </div>
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
              <div key={novel.id} className="admin-card">
                <div className="flex gap-3">
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{novel.title}</h3>
                    <p className="text-sm text-muted-foreground">{novel.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Book className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {novel.chapters.length} chapters
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {novel.languages.map((lang) => (
                        <span key={lang} className="text-xs">
                          {lang === 'en' ? '🇬🇧' : '🇮🇩'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowChapterForm(showChapterForm === novel.id ? null : novel.id)}
                      className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNovel(novel.id)}
                      className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add Chapter Form */}
                {showChapterForm === novel.id && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <h4 className="text-sm font-semibold mb-3">Add Chapter</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Chapter #"
                          value={newChapter.number}
                          onChange={(e) =>
                            setNewChapter({ ...newChapter, number: parseInt(e.target.value) || 1 })
                          }
                          className="admin-input"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={newChapter.title}
                          onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      {novel.languages.includes('en') && (
                        <textarea
                          placeholder="Content (English)"
                          value={newChapter.contentEn}
                          onChange={(e) => setNewChapter({ ...newChapter, contentEn: e.target.value })}
                          className="admin-input min-h-[100px]"
                        />
                      )}
                      {novel.languages.includes('id') && (
                        <textarea
                          placeholder="Content (Indonesian)"
                          value={newChapter.contentId}
                          onChange={(e) => setNewChapter({ ...newChapter, contentId: e.target.value })}
                          className="admin-input min-h-[100px]"
                        />
                      )}
                      <button
                        onClick={() => handleAddChapter(novel.id)}
                        disabled={!newChapter.title || !newChapter.contentEn}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Add Chapter
                      </button>
                    </div>
                  </div>
                )}

                {/* Chapter List */}
                {novel.chapters.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Chapters:</p>
                    <div className="flex flex-wrap gap-1">
                      {novel.chapters.map((ch) => (
                        <span
                          key={ch.id}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          Ch.{ch.number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {novels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No novels yet. Add your first novel!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
