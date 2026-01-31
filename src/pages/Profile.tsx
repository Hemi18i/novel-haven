import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Heart, LogOut, Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StarBackground } from '@/components/StarBackground';
import { BottomNav } from '@/components/BottomNav';

interface FavoriteNovel {
  id: string;
  novel_id: string;
  novels: {
    id: string;
    title: string;
    cover_url: string | null;
    author: string | null;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'library' | 'settings'>('library');
  const [favorites, setFavorites] = useState<FavoriteNovel[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          novel_id,
          novels (
            id,
            title,
            cover_url,
            author
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites((data as unknown as FavoriteNovel[]) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordSuccess('تم تغيير كلمة المرور بنجاح!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20 relative">
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
              <h1 className="ml-2 font-bold">الملف الشخصي</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </header>

        <main className="container px-4 py-6">
          {/* User Info */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  عضو منذ {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'library'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              <Heart className="w-4 h-4" />
              مكتبتي
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              <Lock className="w-4 h-4" />
              الإعدادات
            </button>
          </div>

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div className="animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                الروايات المفضلة
              </h2>

              {loadingFavorites ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد روايات في مكتبتك بعد</p>
                  <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">
                    تصفح الروايات
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="relative group">
                      <Link
                        to={`/novel/${fav.novels.id}`}
                        className="block aspect-[2/3] rounded-lg overflow-hidden"
                      >
                        <img
                          src={fav.novels.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                          alt={fav.novels.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  تغيير كلمة المرور
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="تأكيد كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    dir="ltr"
                  />

                  {passwordError && (
                    <div className="bg-destructive/20 text-destructive text-sm rounded-lg p-3 text-center">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-primary/20 text-primary text-sm rounded-lg p-3 text-center">
                      {passwordSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={changingPassword || !newPassword || !confirmPassword}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50 transition-opacity"
                  >
                    {changingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
