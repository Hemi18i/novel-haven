import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Search, User } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';
import { StarBackground } from '@/components/StarBackground';
import { BottomNav } from '@/components/BottomNav';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CatalogPage = () => {
  const { letter: initialLetter } = useParams<{ letter: string }>();
  const { novels, loading } = useNovels();
  const { user } = useAuth();
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter?.toUpperCase() || 'A');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredNovels = useMemo(() => {
    return novels
      .filter((n) => n.title.toUpperCase().startsWith(selectedLetter))
      .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [novels, selectedLetter, searchQuery]);

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

  return (
    <div className="min-h-screen pb-20 relative">
      <StarBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <Link to="/" className="p-2 text-muted-foreground hover:text-foreground transition-colors -ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <Link to="/" className="text-xl font-black text-primary text-glow">
              LUNAR<span className="text-foreground">.</span>
            </Link>

            <div className="flex items-center gap-3">
              {showSearch && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              )}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                to={user ? '/profile' : '/auth'}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* Letter Heading */}
          <div className="mb-6">
            <h1 className="text-4xl font-black text-primary mb-2">Letter {selectedLetter}</h1>
            <p className="text-muted-foreground text-sm">
              Books starting with "{selectedLetter}": {filteredNovels.length}
            </p>
          </div>

          {/* Alphabet Navigation */}
          <div className="mb-6 pb-4 border-b border-border/30">
            <div className="flex gap-1 flex-wrap">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-all ${
                    selectedLetter === letter
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* List View */}
          {filteredNovels.length > 0 ? (
            <div className="space-y-3">
              {filteredNovels.map((novel) => (
                <Link
                  key={novel.id}
                  to={`/novel/${novel.id}`}
                  className="flex gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
                    <img
                      src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=160&fit=crop'}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {novel.title}
                    </h3>
                    {novel.author && (
                      <p className="text-xs text-muted-foreground mt-1">by {novel.author}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No novels found starting with "{selectedLetter}"</p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default CatalogPage;
