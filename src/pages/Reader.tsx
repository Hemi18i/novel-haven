import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { useNovelDetails } from '@/hooks/useNovels';
import { BottomNav } from '@/components/BottomNav';

type ReadingMode = 'vertical' | 'horizontal';

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { novel, chapters, loading, error } = useNovelDetails(id || '');
  const language = (searchParams.get('lang') as 'en' | 'id') || 'en';
  const chapterNumber = parseInt(searchParams.get('chapter') || '1', 10);

  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentChapterIndex = chapters.findIndex((ch) => ch.number === chapterNumber);
  const chapter = chapters[currentChapterIndex];
  
  // Get content based on language
  const content = language === 'id' 
    ? (chapter?.content_id || chapter?.content_en || '') 
    : (chapter?.content_en || '');

  // Extract paragraphs from HTML for horizontal reading
  const extractParagraphs = (html: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs = doc.querySelectorAll('p');
    return Array.from(paragraphs).map(p => p.outerHTML);
  };

  const htmlParagraphs = extractParagraphs(content);
  const pages = readingMode === 'horizontal' ? htmlParagraphs : [content];

  useEffect(() => {
    setCurrentPage(0);
  }, [chapterNumber, language]);

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

  if (error || !novel || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chapter not found</p>
          <button
            onClick={() => navigate(`/novel/${id}`)}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      navigate(`/read/${id}?lang=${language}&chapter=${nextChapter.number}`);
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/read/${id}?lang=${language}&chapter=${prevChapter.number}`);
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (readingMode === 'horizontal') {
          if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
          } else {
            goToNextChapter();
          }
        }
      } else {
        if (readingMode === 'horizontal') {
          if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else {
            goToPrevChapter();
          }
        }
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(`/novel/${id}`, { replace: true })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <p className="text-xs text-muted-foreground truncate">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-12 right-0 left-0 z-40 bg-card border-b border-border p-4 animate-fade-in">
          <div className="container">
            <p className="text-sm font-semibold mb-3">Reading Mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => setReadingMode('vertical')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  readingMode === 'vertical'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Vertical Scroll
              </button>
              <button
                onClick={() => setReadingMode('horizontal')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  readingMode === 'horizontal'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <ChevronRight className="w-4 h-4 inline mr-2" />
                Horizontal Flip
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Language: {language === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`container px-4 py-6 ${
          readingMode === 'horizontal'
            ? 'min-h-[calc(100vh-120px)] flex items-start pb-40'
            : 'pb-24'
        }`}
      >
        {readingMode === 'vertical' ? (
          <div className="max-w-none">
            <div 
              className="chapter-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {/* Chapter Break */}
            <div className="py-8 flex items-center justify-center border-t border-b border-border/30 my-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  End of Chapter {chapter.number}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={goToPrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextChapter}
                    disabled={currentChapterIndex >= chapters.length - 1}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Next Chapter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full animate-fade-in" key={currentPage}>
            <div 
              className="chapter-content"
              dangerouslySetInnerHTML={{ __html: pages[currentPage] || '' }}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation for Horizontal Mode */}
      {readingMode === 'horizontal' && (
        <div className="fixed bottom-16 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/50 py-3">
          <div className="container flex items-center justify-between px-4">
            <button
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                } else {
                  goToPrevChapter();
                }
              }}
              disabled={currentPage === 0 && currentChapterIndex === 0}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {pages.length}
              </p>
              <div className="flex gap-1 mt-1 justify-center">
                {pages.slice(0, 10).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
                {pages.length > 10 && <span className="text-xs text-muted-foreground">...</span>}
              </div>
            </div>
            
            <button
              onClick={() => {
                if (currentPage < pages.length - 1) {
                  setCurrentPage(currentPage + 1);
                } else {
                  goToNextChapter();
                }
              }}
              disabled={currentPage >= pages.length - 1 && currentChapterIndex >= chapters.length - 1}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Global bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default Reader;
