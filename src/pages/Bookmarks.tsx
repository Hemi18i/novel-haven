import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { StarBackground } from '@/components/StarBackground';
import { BottomNav } from '@/components/BottomNav';

const Bookmarks = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();

  if (!user) {
    return (
      <div className="min-h-screen pb-20 relative">
        <StarBackground />
        <div className="relative z-10">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="container flex items-center h-14 px-4">
              <h1 className="text-lg font-bold">Bookmarks</h1>
            </div>
          </header>
          
          <div className="container px-4 py-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">Sign in to see your bookmarks</h2>
            <p className="text-muted-foreground mb-6">Save your favorite novels to read later</p>
            <Link
              to="/auth"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <StarBackground />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <h1 className="text-lg font-bold">Bookmarks</h1>
          </div>
        </header>

        <main className="container px-4 py-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold mb-2">No bookmarks yet</h2>
              <p className="text-muted-foreground">Start adding novels to your bookmarks!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {favorites.map((novel, index) => (
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
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Bookmarks;
