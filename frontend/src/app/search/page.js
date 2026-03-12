'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { movieAPI } from '@/lib/api';
import MovieCard, { MovieCardSkeleton } from '@/components/MovieCard';
import { Search, X } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    setInputVal(query);
    if (!query) { setResults([]); return; }

    const search = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await movieAPI.searchMovies(query, page);
        const items = res?.data?.items || res?.data?.movies || res?.data?.data || [];
        const total = res?.data?.paginate?.total_page || res?.data?.totalPages || 1;
        setResults(items);
        setTotalPages(total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setPage(1);
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-enter">
      <h1 className="font-display text-4xl text-white mb-6 tracking-wide">TÌM KIẾM PHIM</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Nhập tên phim, diễn viên..."
            className="input-dark w-full pl-12 pr-10 py-3.5 rounded-2xl text-base"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Results header */}
      {query && !loading && (
        <p className="text-gray-400 text-sm mb-6">
          {results.length > 0
            ? `Tìm thấy ${results.length} kết quả cho "${query}"`
            : `Không tìm thấy kết quả cho "${query}"`}
        </p>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : results.map((movie, i) => (
            <MovieCard key={movie.slug || i} movie={movie} className="w-full" />
          ))
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-2 rounded-xl text-sm disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-400">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-4 py-2 rounded-xl text-sm disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div className="text-center py-24">
          <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nhập tên phim để tìm kiếm</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-8 text-white">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
