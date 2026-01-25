import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { useNovelStore } from '@/stores/novelStore';
import { ReadingMode } from '@/types/novel';

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    novels,
    selectedLanguage,
    readingMode,
    setReadingMode,
    currentChapter,
    setCurrentChapter,
  } = useNovelStore();

  const novel = novels.find((n) => n.id === id);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [currentChapter]);

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Novel not found</p>
      </div>
    );
  }

  const chapter = novel.chapters[currentChapter];
  const content = chapter?.content[selectedLanguage] || chapter?.content.en || '';
  
  // Split content into pages for horizontal reading
  const paragraphs = content.split('\n\n').filter(Boolean);
  const pages = readingMode === 'horizontal' ? paragraphs : [content];

  const goToNextChapter = () => {
    if (currentChapter < novel.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
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
        // Swipe left - next page/chapter
        if (readingMode === 'horizontal') {
          if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
          } else {
            goToNextChapter();
          }
        }
      } else {
        // Swipe right - prev page/chapter
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(`/novel/${id}`)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <p className="text-xs text-muted-foreground truncate">
              Chapter {chapter?.number}: {chapter?.title}
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
              Language: {selectedLanguage === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`container px-4 py-6 ${
          readingMode === 'horizontal' ? 'page-container flex items-start' : ''
        }`}
      >
        {readingMode === 'vertical' ? (
          // Vertical Scroll Mode
          <div className="prose prose-invert max-w-none">
            {paragraphs.map((para, index) => (
              <p key={index} className="text-foreground/90 leading-relaxed mb-4 text-sm">
                {para}
              </p>
            ))}
            
            {/* Chapter Break */}
            <div className="chapter-break">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  End of Chapter {chapter?.number}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={goToPrevChapter}
                    disabled={currentChapter === 0}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextChapter}
                    disabled={currentChapter >= novel.chapters.length - 1}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Next Chapter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Horizontal Flip Mode
          <div className="w-full animate-fade-in" key={currentPage}>
            <p className="text-foreground/90 leading-relaxed text-sm">
              {pages[currentPage]}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation for Horizontal Mode */}
      {readingMode === 'horizontal' && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/50 py-3">
          <div className="container flex items-center justify-between px-4">
            <button
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                } else {
                  goToPrevChapter();
                }
              }}
              disabled={currentPage === 0 && currentChapter === 0}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {pages.length}
              </p>
              <div className="flex gap-1 mt-1 justify-center">
                {pages.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
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
              disabled={currentPage >= pages.length - 1 && currentChapter >= novel.chapters.length - 1}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;
