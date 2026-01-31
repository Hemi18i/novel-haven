import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Crown, Flame, ChevronRight, Search, User } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';
import { StarBackground } from '@/components/StarBackground';
import { BottomNav } from '@/components/BottomNav';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Index = () => {
  const { novels, loading } = useNovels();
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<'new' | 'popular'>('new');
  const [subTab, setSubTab] = useState<'latest' | 'popular'>('latest');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showAlphabet, setShowAlphabet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter novels based on tabs
  const newArrivals = novels
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 9);

  const popularNovels = novels
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 9);

  const officialNovels = novels.filter((n) => n.is_official);

  const latestUpdated = novels
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 9);

  const displayedNovels = mainTab === 'new' ? newArrivals : popularNovels;
  const bottomNovels = subTab === 'latest' ? latestUpdated : popularNovels;

  // Filter by alphabet
  const filteredBottomNovels = selectedLetter
    ? bottomNovels.filter((n) => n.title.toUpperCase().startsWith(selectedLetter))
    : bottomNovels;

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

        <main className="container px-4 py-4">
          {/* Main Tabs - NEW ARRIVALS / POPULAR */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMainTab('new')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                mainTab === 'new'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              NEW ARRIVALS
            </button>
            <button
              onClick={() => setMainTab('popular')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                mainTab === 'popular'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              <Flame className="w-4 h-4 inline mr-2" />
              POPULAR
            </button>
          </div>

          {/* Main Grid - Covers Only */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {displayedNovels.map((novel, index) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="relative aspect-[2/3] rounded-lg overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    READ
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* OFFICIAL Section */}
          {officialNovels.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  OFFICIAL SERIES
                </h2>
                <Link to="/?section=official" className="text-xs text-accent hover:underline flex items-center">
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
                <CarouselContent className="-ml-2">
                  {officialNovels.map((novel) => (
                    <CarouselItem key={novel.id} className="pl-2 basis-2/5 md:basis-1/4">
                      <Link
                        to={`/novel/${novel.id}`}
                        className="block relative aspect-[2/3] rounded-xl overflow-hidden group"
                      >
                        <img
                          src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                          alt={novel.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold">
                            OFFICIAL
                          </span>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}

          {/* Sub Tabs - Latest Update / Popular */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSubTab('latest')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  subTab === 'latest'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                LATEST UPDATE
              </button>
              <button
                onClick={() => setSubTab('popular')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  subTab === 'popular'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                POPULAR
              </button>
            </div>
            <button
              onClick={() => setShowAlphabet(!showAlphabet)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                showAlphabet ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              A-Z
            </button>
          </div>

          {/* Alphabet Filter */}
          {showAlphabet && (
            <div className="grid grid-cols-9 gap-1.5 mb-4 animate-fade-in">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  !selectedLetter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:bg-primary/20'
                }`}
              >
                ALL
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                  className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    selectedLetter === letter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:bg-primary/20'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredBottomNovels.map((novel, index) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="relative aspect-[2/3] rounded-lg overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    READ
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredBottomNovels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No novels found</p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
