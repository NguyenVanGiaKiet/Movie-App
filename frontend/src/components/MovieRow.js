'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard, { MovieCardSkeleton } from './MovieCard';

export default function MovieRow({ title, movies = [], loading = false, error = null }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      const amount = dir === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          <span className="border-l-4 border-brand-red pl-3">{title}</span>
        </h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="p-1.5 rounded-full glass hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="p-1.5 rounded-full glass hover:bg-white/20 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={rowRef}
          className="scroll-row px-4 sm:px-6 lg:px-8"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : error
            ? (
              <p className="text-gray-500 text-sm py-4">Không thể tải phim. Vui lòng thử lại.</p>
            )
            : movies.map((movie, i) => (
              <MovieCard key={movie.slug || i} movie={movie} />
            ))
          }
        </div>
      </div>
    </section>
  );
}
