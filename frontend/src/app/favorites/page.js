'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { favoriteAPI } from '@/lib/api';
import { Heart, Play, Trash2, Film, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, authLoading]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteAPI.getFavorites();
      setFavorites(res?.data?.favorites || []);
    } catch (err) {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (slug, name) => {
    setRemoving(slug);
    try {
      await favoriteAPI.removeFavorite(slug);
      setFavorites(f => f.filter(fav => fav.movieSlug !== slug));
      toast.success(`Đã xóa "${name}" khỏi yêu thích`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="h-8 skeleton rounded w-64 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="aspect-[2/3] skeleton" />
              <div className="p-2 bg-dark-card space-y-2">
                <div className="h-3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-enter">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-brand-red fill-brand-red" />
        <h1 className="font-display text-4xl text-white tracking-wide">PHIM YÊU THÍCH</h1>
        <span className="ml-2 text-gray-500 text-lg">({favorites.length})</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-xl mb-2">Danh sách yêu thích trống</p>
          <p className="text-gray-600 text-sm mb-6">Hãy thêm những bộ phim bạn yêu thích</p>
          <Link href="/" className="btn-primary inline-flex px-6 py-2.5 rounded-full text-sm">
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((fav) => {
            const movie = fav.movieData || {};
            const thumb = movie.thumb_url || movie.poster_url || '';
            const name = movie.name || fav.movieSlug;

            return (
              <div key={fav._id} className="group relative movie-card rounded-xl overflow-hidden bg-dark-card">
                {/* Thumbnail */}
                <Link href={`/movie/${fav.movieSlug}`}>
                  <div className="relative aspect-[2/3]">
                    {thumb ? (
                      <Image src={thumb} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="200px" />
                    ) : (
                      <div className="w-full h-full bg-dark-muted flex items-center justify-center">
                        <Film className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-card-gradient opacity-60" />

                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Quality badge */}
                    {movie.quality && (
                      <div className="absolute top-2 left-2 badge-quality bg-brand-red text-white">
                        {movie.quality}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-brand-red transition-colors">
                    {name}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-500">{movie.year || ''}</span>
                    <button
                      onClick={() => removeFavorite(fav.movieSlug, name)}
                      disabled={removing === fav.movieSlug}
                      className="p-1 rounded text-gray-500 hover:text-brand-red transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
