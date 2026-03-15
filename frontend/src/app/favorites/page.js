'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { favoriteAPI } from '@/lib/api';
import MovieCard, { MovieCardSkeleton } from '@/components/MovieCard';
import { Heart, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites,  setFavorites]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editMode,   setEditMode]   = useState(false);
  const [removing,   setRemoving]   = useState(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!authLoading && isAuthenticated) { fetchFavorites(); }
  }, [isAuthenticated, authLoading]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteAPI.getFavorites();
      setFavorites(res?.data?.favorites || []);
    } catch { toast.error('Không thể tải danh sách yêu thích'); }
    finally { setLoading(false); }
  };

  const remove = async (slug, name) => {
    setRemoving(s => new Set(s).add(slug));
    try {
      await favoriteAPI.removeFavorite(slug);
      setFavorites(f => f.filter(fav => fav.movieSlug !== slug));
      toast.success(`Đã xóa khỏi yêu thích`);
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setRemoving(s => { const n = new Set(s); n.delete(slug); return n; }); }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="fav-header-skeleton">
          <div className="skeleton" style={{ height: 36, width: 260, borderRadius: 6 }} />
        </div>
        <div className="fav-grid">
          {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="fav-root page-enter">

        {/* Header */}
        <div className="fav-header">
          <span className="fav-title-bar" />
          <h1 className="fav-title">Yêu Thích</h1>
          {favorites.length > 0 && (
            <span className="fav-count">({favorites.length})</span>
          )}
          {favorites.length > 0 && (
            <button
              onClick={() => setEditMode(v => !v)}
              className={`fav-edit-btn ${editMode ? 'active' : 'idle'}`}
            >
              {editMode
                ? <><X style={{ width: 14, height: 14 }} /> Xong</>
                : <><Trash2 style={{ width: 14, height: 14 }} /> Chỉnh sửa</>
              }
            </button>
          )}
        </div>

        {/* Grid */}
        {favorites.length === 0 ? (
          <div className="fav-empty">
            <Heart className="fav-empty-icon" style={{ width: 72, height: 72, color: '#E50914' }} />
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 18, marginBottom: 8 }}>
              Danh sách yêu thích trống
            </p>
            <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 13, marginBottom: 28 }}>
              Hãy thêm những bộ phim bạn yêu thích
            </p>
            <Link href="/" className="btn-primary inline-flex px-6 py-2.5 rounded-full text-sm">
              Khám phá phim
            </Link>
          </div>
        ) : (
          <div className={`fav-grid ${editMode ? 'fav-edit-active' : ''}`}>
            {favorites.map((fav, i) => {
              const movie = { ...(fav.movieData || {}), slug: fav.movieSlug };
              const isRemoving = removing.has(fav.movieSlug);
              return (
                <div key={fav._id} className="fav-card-wrap">
                  <MovieCard
                    movie={movie}
                    className="w-full"
                    priority={i < 6}
                    onClick={editMode ? (e) => e.preventDefault() : undefined}
                  />
                  <button
                    className={`fav-del-btn${isRemoving ? ' removing' : ''}`}
                    onClick={() => remove(fav.movieSlug, movie.name)}
                    disabled={isRemoving}
                    title={`Xóa "${movie.name}"`}
                  >
                    <div className="fav-del-inner">
                      <X style={{ width: 22, height: 22, color: 'white' }} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
