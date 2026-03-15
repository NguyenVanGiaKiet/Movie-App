'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight, Film } from 'lucide-react';

const SLIDE_INTERVAL = 5000;

export default function SeriesBanner({ movies = [], loading = false }) {
  const items = movies.slice(0, 8);
  const [current,   setCurrent]   = useState(0);
  const [animDir,   setAnimDir]   = useState(1); // 1=forward, -1=back
  const [dragging,  setDragging]  = useState(false);
  const currentRef = useRef(0);
  const timerRef   = useRef(null);
  const dragStart  = useRef(null);

  const goTo = useCallback((idx, dir = 1) => {
    if (idx === currentRef.current || items.length < 2) return;
    setAnimDir(dir);
    currentRef.current = idx;
    setCurrent(idx);
  }, [items.length]);

  const next = useCallback(() => goTo((currentRef.current + 1) % items.length, 1),  [goTo, items.length]);
  const prev = useCallback(() => goTo((currentRef.current - 1 + items.length) % items.length, -1), [goTo, items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [next, items.length]);

  const onDragStart = (e) => { dragStart.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX; setDragging(true); };
  const onDragEnd   = (e) => {
    if (!dragging || dragStart.current === null) return;
    setDragging(false);
    const end = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart.current - end;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    dragStart.current = null;
  };

  if (loading) return (
    <div className="sb-root">
      <div className="sb-header">
        <h2 className="mr-title"><span className="mr-title-bar" />Phim Bộ</h2>
      </div>
      <div className="sb-skeleton skeleton" />
    </div>
  );

  if (!items.length) return null;

  const movie = items[current];
  const bg    = movie.poster_url || '';
  const desc  = (movie.content || movie.description || '').replace(/<[^>]*>/g, '').trim();

  return (
    <section className="sb-root">
      {/* Section heading */}
      <div className="sb-header">
        <h2 className="mr-title"><span className="mr-title-bar" />Phim Bộ</h2>
        <Link href="/phim-bo" className="sb-see-all">Xem tất cả →</Link>
      </div>

      {/* Banner */}
      <div
        className="sb-banner"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onDragStart} onMouseUp={onDragEnd} onMouseLeave={() => { setDragging(false); dragStart.current = null; }}
        onTouchStart={onDragStart} onTouchEnd={onDragEnd}
      >
        {/* Background image */}
        <div key={current} className="sb-bg-wrap">
          {bg && <Image src={bg} alt="" fill className="object-cover sb-bg-img" unoptimized priority />}
        </div>
        {/* Gradients */}
        <div className="sb-grad-l" />
        <div className="sb-grad-b" />

        {/* Content */}
        <div className="sb-content" key={`c-${current}`}>
          <div className="sb-meta-row">
            {movie.quality       && <span className="sb-qlty">{movie.quality}</span>}
            {movie.year          && <span className="sb-pill">{movie.year}</span>}
            {movie.lang          && <span className="sb-pill">{movie.lang}</span>}
            {movie.episode_current && <span className="sb-pill">{movie.episode_current}</span>}
          </div>
          <h3 className="sb-title">{(movie.name || '').toUpperCase()}</h3>
          {movie.origin_name && (
            <p className="sb-origin">{movie.origin_name}</p>
          )}
          {desc && <p className="sb-desc">{desc}</p>}
          <Link href={`/movie/${movie.slug}`} className="sb-btn">
            <Play style={{ width: 16, height: 16, fill: 'white' }} /> Xem ngay
          </Link>
        </div>

        {/* Nav buttons */}
        {items.length > 1 && (
          <>
            <button className="sb-nav sb-nav-l" onClick={prev} aria-label="Trước">
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </button>
            <button className="sb-nav sb-nav-r" onClick={next} aria-label="Sau">
              <ChevronRight style={{ width: 18, height: 18 }} />
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="sb-dots">
            {items.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`sb-dot${i === current ? ' active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="sb-thumbs">
          {items.map((m, i) => (
            <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`sb-thumb${i === current ? ' active' : ''}`}>
              <div className="sb-thumb-img">
                {(m.poster_url) && (
                  <Image src={m.poster_url} alt={m.name || ''} fill style={{ objectFit: 'cover' }} unoptimized />
                )}
                <div className="sb-thumb-ov" />
              </div>
              <p className="sb-thumb-name">{m.name}</p>
            </button>
          ))}
        </div>
      )}

      </section>
  );
}
