import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Languages, Eye, Heart } from 'lucide-react';
import { useNovelDetails } from '@/hooks/useNovels';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { StarBackground } from '@/components/StarBackground';

const NovelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { novel, chapters, loading, error } = useNovelDetails(id || '');
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'id'>('en');
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;
    
    setTogglingFavorite(true);
    await toggleFavorite(id);
    setTogglingFavorite(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Novel not found</p>
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

  const hasEnglish = chapters.some((ch) => ch.content_en || ch.epub_en_url);
  const hasIndonesian = chapters.some((ch) => ch.content_id || ch.epub_id_url);
  const isNovelFavorite = id ? isFavorite(id) : false;

  const handleReadClick = (lang: 'en' | 'id') => {
    setSelectedLanguage(lang);
    navigate(`/read/${id}?lang=${lang}`);
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
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="ml-2 font-semibold truncate">{novel.title}</h1>
            </div>
            <button
              onClick={handleToggleFavorite}
              disabled={togglingFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isNovelFavorite
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={isNovelFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart className={`w-5 h-5 ${isNovelFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* Cover and Info */}
          <div className="flex gap-4 mb-6">
            <div className="w-32 shrink-0">
              <img
                src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                alt={novel.title}
                className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold mb-2">{novel.title}</h2>
              {novel.author && (
                <p className="text-sm text-muted-foreground mb-2">
                  by {novel.author}
                </p>
              )}
              {novel.genre && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {novel.genre.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Book className="w-4 h-4" />
                  <span>{chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{novel.view_count} Views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {novel.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Synopsis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {novel.description}
              </p>
            </div>
          )}

          {/* Language Selection */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Choose Language</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(hasEnglish || chapters.length > 0) && (
                <button
                  onClick={() => handleReadClick('en')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    selectedLanguage === 'en'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  🇬🇧 English
                </button>
              )}
              {hasIndonesian && (
                <button
                  onClick={() => handleReadClick('id')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    selectedLanguage === 'id'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  🇮🇩 Indonesia
                </button>
              )}
            </div>
          </div>

          {/* Chapter List */}
          <div>
            <h3 className="font-semibold mb-3">Chapters</h3>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/read/${id}?lang=${selectedLanguage}&chapter=${chapter.number}`)}
                  className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
                >
                  <div>
                    <span className="text-xs text-primary font-semibold">
                      Chapter {chapter.number}
                    </span>
                    <p className="text-sm font-medium">{chapter.title}</p>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                </button>
              ))}
              
              {chapters.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No chapters available yet
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NovelDetail;
