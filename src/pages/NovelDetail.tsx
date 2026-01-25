import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Languages } from 'lucide-react';
import { useNovelStore } from '@/stores/novelStore';
import { StarBackground } from '@/components/StarBackground';
import { Language } from '@/types/novel';

const NovelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { novels, setSelectedLanguage, selectedLanguage } = useNovelStore();

  const novel = novels.find((n) => n.id === id);

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Novel not found</p>
      </div>
    );
  }

  const handleReadClick = (lang: Language) => {
    setSelectedLanguage(lang);
    navigate(`/read/${id}`);
  };

  return (
    <div className="min-h-screen relative">
      <StarBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 font-semibold truncate">{novel.title}</h1>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* Cover and Info */}
          <div className="flex gap-4 mb-6">
            <div className="w-32 shrink-0">
              <img
                src={novel.cover}
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Book className="w-4 h-4" />
                <span>{novel.chapters.length} Chapters</span>
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
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Choose Language</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {novel.languages.includes('en') && (
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
              {novel.languages.includes('id') && (
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
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Chapters</h3>
            <div className="space-y-2">
              {novel.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    useNovelStore.getState().setCurrentChapter(chapter.number - 1);
                    navigate(`/read/${id}`);
                  }}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NovelDetail;
