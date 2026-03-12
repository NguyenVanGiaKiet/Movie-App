'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { movieAPI } from '@/lib/api';
import MovieCard, { MovieCardSkeleton } from '@/components/MovieCard';
import { Film } from 'lucide-react';
import Link from 'next/link';

// Map URL slug → API call + label
const TYPE_CONFIG = {
  // Danh sách → /api/films/danh-sach/:slug
  'phim-le':         { fn: (p) => movieAPI.getByDanhSach('phim-le', p),        label: '🎬 Phim Lẻ' },
  'phim-bo':         { fn: (p) => movieAPI.getByDanhSach('phim-bo', p),        label: '📺 Phim Bộ' },
  'tv-shows':        { fn: (p) => movieAPI.getByDanhSach('tv-shows', p),       label: '📡 TV Shows' },
  'phim-dang-chieu': { fn: (p) => movieAPI.getByDanhSach('phim-dang-chieu', p), label: '🎥 Phim Đang Chiếu' },
  // Thể loại → /api/films/the-loai/:slug
  'hoat-hinh':       { fn: (p) => movieAPI.getByTheLoai('hoat-hinh', p),       label: '✨ Hoạt Hình' },
  'hanh-dong':       { fn: (p) => movieAPI.getByTheLoai('hanh-dong', p),       label: '💥 Hành Động' },
  'kinh-di':         { fn: (p) => movieAPI.getByTheLoai('kinh-di', p),         label: '👻 Kinh Dị' },
  'tinh-cam':        { fn: (p) => movieAPI.getByTheLoai('tinh-cam', p),        label: '💕 Tình Cảm' },
  'vien-tuong':      { fn: (p) => movieAPI.getByTheLoai('khoa-hoc-vien-tuong', p), label: '🚀 Viễn Tưởng' },
};

function extractItems(res) {
  const d = res?.data;
  return d?.items || d?.movies || d?.data || [];
}

export default function TypePage() {
  const { type } = useParams();
  const [movies,     setMovies]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error,      setError]      = useState('');

  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (!config) return;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await config.fn(page);
        setMovies(extractItems(res));
        const total = res?.data?.paginate?.total_page || res?.data?.totalPages || 1;
        setTotalPages(total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [type, page]);

  if (!config) return (
    <div className="min-h-screen flex items-center justify-center pt-16 text-center">
      <div>
        <p className="text-gray-400 text-xl mb-4">Danh mục không tồn tại</p>
        <Link href="/" className="btn-primary inline-flex px-6 py-2.5 rounded-full text-sm">Về trang chủ</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-enter">
      <h1 className="font-display text-4xl text-white mb-8 tracking-wide">
        <span className="border-l-4 border-brand-red pl-3">{(config.label || type).toUpperCase()}</span>
      </h1>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((movie, i) => <MovieCard key={movie.slug || i} movie={movie} className="w-full" />)
        }
      </div>

      {!loading && movies.length === 0 && !error && (
        <div className="text-center py-24">
          <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Không có phim nào</p>
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary px-4 py-2 rounded-xl text-sm disabled:opacity-40">← Trước</button>
          <span className="px-4 py-2 text-sm text-gray-400">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-secondary px-4 py-2 rounded-xl text-sm disabled:opacity-40">Sau →</button>
        </div>
      )}
    </div>
  );
}
