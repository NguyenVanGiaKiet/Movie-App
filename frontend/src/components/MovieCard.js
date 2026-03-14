'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Play } from 'lucide-react';

const QUALITY_STYLE = {
  FHD:  { bg: '#1a56db' },
  '4K': { bg: '#7e3af2' },
  HD:   { bg: '#057a55' },
  CAM:  { bg: '#c27803' },
  SD:   { bg: '#374151' },
};

function getQuality(q = '') {
  const key = Object.keys(QUALITY_STYLE).find(k => q.toUpperCase().includes(k));
  return { bg: key ? QUALITY_STYLE[key].bg : '#E50914', label: q || 'HD' };
}

function extractYear(movie) {
  if (!movie) return '';
  for (const v of [movie.year, movie.release_year, movie.publishYear, movie.publish_year]) {
    if (v && String(v).match(/^\d{4}$/)) return String(v);
  }
  return '';
}

export default function MovieCard({ movie, className = '' }) {
  const [imgErr, setImgErr] = useState(false);

  if (!movie) return null;

  const slug   = movie.slug || '';
  const name   = movie.name || movie.title || 'Không có tên';
  const origin = movie.origin_name || '';
  const thumb  = !imgErr ? (movie.thumb_url || movie.poster_url || '') : '';
  const year   = extractYear(movie);
  const qlty   = getQuality(movie.quality || '');
  const ep     = movie.episode_current || '';
  const cats   = (movie.category || []).slice(0, 2);

  return (
    <Link href={`/movie/${slug}`} className={`mc-root ${className}`}>
      <div className="mc-card">
        <div className="mc-poster">
          {thumb ? (
            <Image src={thumb} alt={name} fill className="object-cover"
              onError={() => setImgErr(true)}
              sizes="(max-width:640px) 160px, 176px" />
          ) : (
            <div className="mc-fallback">
              <Play style={{ width: 36, height: 36, color: 'rgba(255,255,255,.2)' }} />
            </div>
          )}

          <div className="mc-grad" />
          <div className="mc-qlty" style={{ background: qlty.bg }}>{qlty.label}</div>
          {ep && <div className="mc-ep">{ep}</div>}

          <div className="mc-play-wrap">
            <div className="mc-play-btn">
              <Play style={{ width: 22, height: 22, fill: 'white', color: 'white', marginLeft: 3 }} />
            </div>
          </div>

          {cats.length > 0 && (
            <div className="mc-hover-info">
              <div className="mc-hover-cats">
                {cats.map((c, i) => (
                  <span key={i} className="mc-cat-tag">{c.name || c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mc-info">
        <p className="mc-name">{name}</p>
        {origin && <p className="mc-origin">{origin}</p>}
        <div className="mc-meta">
          {year && <span className="mc-year">{year}</span>}
          {movie.lang && <span className="mc-lang">{movie.lang}</span>}
        </div>
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div style={{ flexShrink: 0, width: 160 }}>
      <div style={{ borderRadius: 10, overflow: 'hidden' }}>
        <div className="skeleton" style={{ aspectRatio: '2/3' }} />
        <div style={{ padding: '10px 2px 4px' }}>
          <div className="skeleton" style={{ height: 13, borderRadius: 4, width: '85%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, borderRadius: 4, width: '55%' }} />
        </div>
      </div>
    </div>
  );
}
