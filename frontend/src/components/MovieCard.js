'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function MovieCard({ movie, className = '', priority = false, disabled = false }) {
  const [imgErr, setImgErr] = useState(false);

  if (!movie) return null;

  const slug   = movie.slug || '';
  const name   = movie.name || movie.title || 'Không có tên';
  const origin = movie.origin_name || '';
  const thumb  = !imgErr ? (movie.thumb_url || movie.poster_url || '') : '';

  return (
    <Link 
      href={`/movie/${slug}`} 
      className={`mc-root ${className}`}
      style={{ 
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'pointer'
      }}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="mc-card">
        <div className="mc-poster">
          {thumb ? (
            <Image src={thumb} alt={name} fill className="object-cover"
              onError={() => setImgErr(true)}
              sizes="(max-width:640px) 160px, 176px"
              priority={priority} />
          ) : null}
        </div>
      </div>

      <div className="mc-info">
        <p className="mc-name">{name}</p>
        {origin && <p className="mc-origin">{origin}</p>}
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
