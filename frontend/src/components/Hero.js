'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Star, Calendar } from 'lucide-react';

export default function Hero({ movies = [] }) {
  const [current, setCurrent] = useState(0);
  const featured = movies.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return <div className="h-[70vh] skeleton" />;

  const movie = featured[current];
  if (!movie) return null;

  const bg = movie.poster_url || movie.thumb_url || '';
  const name = movie.name || 'Không có tên';
  const originName = movie.origin_name || '';
  const desc = movie.content || movie.description || '';
  const year = movie.year || '';
  const quality = movie.quality || '';
  const categories = (movie.category || []).slice(0, 3);

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background image */}
      {bg && (
        <Image
          key={current}
          src={bg}
          alt={name}
          fill
          className="object-cover animate-fade-in"
          priority
          quality={85}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl animate-slide-up" key={current}>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((c, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full glass text-gray-300 border border-white/10">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-none tracking-wide mb-2">
              {name.toUpperCase()}
            </h1>
            {originName && originName !== name && (
              <p className="text-gray-400 text-lg mb-3">{originName}</p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {year}
                </span>
              )}
              {quality && (
                <span className="px-2 py-0.5 bg-brand-red rounded text-white text-xs font-bold">
                  {quality}
                </span>
              )}
            </div>

            {/* Description */}
            {desc && (
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-6 max-w-md">
                {desc.replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/movie/${movie.slug}`} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold">
                <Play className="w-4 h-4 fill-white" /> Xem ngay
              </Link>
              <Link href={`/movie/${movie.slug}`} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold">
                <Info className="w-4 h-4" /> Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-brand-red' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
