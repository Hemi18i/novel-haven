import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { StarBackground } from '@/components/StarBackground';
import { BottomNav } from '@/components/BottomNav';

const SearchPage = () => {
  const { novels, loading } = useNovels();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNovels = novels.filter((novel) =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.genre?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20 relative">
      <StarBackground />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <h1 className="text-lg font-bold">Search</h1>
          </div>
        </header>

        <main className="container px-4 py-4">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search novels, authors, genres..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : searchQuery ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredNovels.length} result{filteredNovels.length !== 1 ? 's' : ''} found
              </p>
              
              {filteredNovels.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h2 className="text-lg font-semibold mb-2">No results found</h2>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredNovels.map((novel, index) => (
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
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold mb-2">Search for novels</h2>
              <p className="text-muted-foreground">Find your next favorite story</p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default SearchPage;
