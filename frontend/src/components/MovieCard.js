'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Play } from 'lucide-react';
import clsx from 'clsx';

const qualityColors = {
  FHD: 'bg-blue-600',
  HD: 'bg-green-600',
  SD: 'bg-gray-600',
  CAM: 'bg-yellow-600',
};

function getQualityColor(q = '') {
  const key = Object.keys(qualityColors).find(k =>
    q.toUpperCase().includes(k.toUpperCase())
  );
  return key ? qualityColors[key] : 'bg-brand-red';
}

// Trích xuất năm từ nhiều trường khác nhau của API
function extractYear(movie) {
  if (!movie) return '';
  // Thử lần lượt các trường có thể chứa năm
  const candidates = [
    movie.year,
    movie.release_year,
    movie.publishYear,
    movie.publish_year,
  ];
  for (const v of candidates) {
    if (v && String(v).match(/^\d{4}$/)) return String(v);
  }
  // Thử parse từ chuỗi "2024" trong episode_current hoặc name
  if (movie.modified?.time) {
    const m = String(movie.modified.time).match(/(\d{4})/);
    if (m) return m[1];
  }
  return '';
}

export default function MovieCard({ movie, className }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!movie) return null;

  const slug            = movie.slug || '';
  const name            = movie.name || movie.title || 'Không có tên';
  const originName      = movie.origin_name || '';
  const thumb           = movie.thumb_url || movie.poster_url || '';
  const year            = extractYear(movie);
  const quality         = movie.quality || '';
  const lang            = movie.lang || '';
  const episodeCurrent  = movie.episode_current || '';

  return (
    <Link href={`/movie/${slug}`} className={clsx('group block flex-shrink-0 w-40 sm:w-44', className)}>
      <div
        className="movie-card relative rounded-xl overflow-hidden bg-dark-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {!imgError && thumb ? (
            <Image
              src={thumb}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 160px, 176px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[#2a2a35] flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-600" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Quality badge */}
          {quality && (
            <div className={`absolute top-2 left-2 badge-quality text-white ${getQualityColor(quality)}`}>
              {quality}
            </div>
          )}

          {/* Episode badge */}
          {episodeCurrent && (
            <div className="absolute top-2 right-2 bg-black/70 text-white badge-quality rounded">
              {episodeCurrent}
            </div>
          )}

          {/* Year overlay bottom-left */}
          {year && (
            <div className="absolute bottom-2 left-2 text-[11px] font-semibold text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
              {year}
            </div>
          )}

          {/* Play button on hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-brand-red transition-colors">
            {name}
          </h3>
          {originName && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{originName}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {year && (
              <span className="text-xs text-gray-400 font-medium">{year}</span>
            )}
            {lang && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{lang}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton
export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 sm:w-44">
      <div className="rounded-xl overflow-hidden">
        <div className="aspect-[2/3] skeleton" />
        <div className="p-2.5 space-y-2 bg-[#1a1a22]">
          <div className="h-3 skeleton rounded w-4/5" />
          <div className="h-3 skeleton rounded w-2/5" />
        </div>
      </div>
    </div>
  );
}
