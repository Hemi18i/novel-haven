import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Crown, Flame } from 'lucide-react';
import { useNovelStore } from '@/stores/novelStore';
import { NovelCard } from '@/components/NovelCard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StarBackground } from '@/components/StarBackground';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Index = () => {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'popular';
  
  const { novels } = useNovelStore();
  const [activeTab, setActiveTab] = useState<'all' | 'a-z'>('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter novels based on search and section
  const filteredNovels = useMemo(() => {
    let result = [...novels];

    // Search filter
    if (searchQuery) {
      result = result.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Section filter
    if (section === 'new') {
      result = result.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (section === 'official') {
      result = result.filter((n) => n.status === 'completed');
    }

    // Alphabet filter
    if (activeTab === 'a-z' && selectedLetter) {
      result = result.filter((n) =>
        n.title.toUpperCase().startsWith(selectedLetter)
      );
    } else if (activeTab === 'a-z') {
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [novels, searchQuery, section, activeTab, selectedLetter]);

  const getSectionTitle = () => {
    switch (section) {
      case 'new':
        return { icon: Sparkles, title: 'New Novels' };
      case 'official':
        return { icon: Crown, title: 'Official Series' };
      default:
        return { icon: Flame, title: 'Popular Novels' };
    }
  };

  const { icon: SectionIcon, title: sectionTitle } = getSectionTitle();

  return (
    <div className="min-h-screen pb-20 relative">
      <StarBackground />
      <div className="relative z-10">
        <Header onSearch={setSearchQuery} />

        <main className="container px-4 py-6">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              <SectionIcon className="w-4 h-4 section-icon" />
              {sectionTitle}
            </h2>
          </div>

          {/* Tabs for Popular section */}
          {section === 'popular' && (
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedLetter(null);
                  }}
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('a-z')}
                  className={`tab-button ${activeTab === 'a-z' ? 'active' : ''}`}
                >
                  A-Z
                </button>
              </div>

              {/* Alphabet Grid */}
              {activeTab === 'a-z' && (
                <div className="grid grid-cols-9 gap-2 mb-4 animate-fade-in">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() =>
                        setSelectedLetter(selectedLetter === letter ? null : letter)
                      }
                      className={`alphabet-btn ${
                        selectedLetter === letter ? 'active' : ''
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Novel Grid - 3 columns on mobile */}
          <div className="grid grid-cols-3 gap-3">
            {filteredNovels.map((novel, index) => (
              <div
                key={novel.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>

          {filteredNovels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No novels found</p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
