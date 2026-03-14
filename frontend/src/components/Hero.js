'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const INTERVAL = 7000;

export default function Hero({ movies = [] }) {
  const featured = movies.slice(0, 6);
  const total    = featured.length;

  const [current,  setCurrent]  = useState(0);
  const [prev,     setPrev]     = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Use ref to always have fresh index in timer callbacks
  const currentRef   = useRef(0);
  const transitingRef = useRef(false);
  const timerRef     = useRef(null);
  const progRef      = useRef(null);
  const dragStart    = useRef(null);

  const goTo = (idx) => {
    if (idx === currentRef.current) return;
    // Allow even if transitioning (timer wins over animation)
    transitingRef.current = true;
    setPrev(currentRef.current);
    currentRef.current = idx;
    setCurrent(idx);
    setProgress(0);
    setTimeout(() => { transitingRef.current = false; }, 700);
  };

  const startTimer = () => {
    clearInterval(progRef.current);
    clearTimeout(timerRef.current);

    if (total <= 1) return;

    const startTime = Date.now();
    setProgress(0);

    progRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / INTERVAL) * 100, 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      // Always use ref for fresh value
      const next = (currentRef.current + 1) % total;
      goTo(next);
    }, INTERVAL);
  };

  // Start timer when current changes
  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(progRef.current);
      clearTimeout(timerRef.current);
    };
  }, [current, total]); // eslint-disable-line

  // Remove prev after animation
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 750);
    return () => clearTimeout(t);
  }, [current]);

  // Keyboard
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  { goTo((currentRef.current - 1 + total) % total); }
      if (e.key === 'ArrowRight') { goTo((currentRef.current + 1) % total); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [total]);

  // Drag / swipe
  const onDragStart = (e) => {
    dragStart.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragging(true);
  };
  const onDragEnd = (e) => {
    if (dragStart.current === null) return;
    setDragging(false);
    const end  = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart.current - end;
    if (Math.abs(diff) > 50) {
      diff > 0
        ? goTo((currentRef.current + 1) % total)
        : goTo((currentRef.current - 1 + total) % total);
    }
    dragStart.current = null;
  };

  if (!total) return <div className="hero-root skeleton" />;

  const movie     = featured[current];
  const prevMovie = prev !== null ? featured[prev] : null;
  if (!movie) return null;

  const bg   = movie.poster_url || movie.thumb_url || '';
  const cats = (movie.category || []).slice(0, 3);
  const desc = (movie.content || movie.description || '').replace(/<[^>]*>/g, '').trim();

  return (
    <div
      className="hero-root"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={() => { setDragging(false); dragStart.current = null; }}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
    >
      {/* ── Prev bg (fading out) ── */}
      {prevMovie && (
        <div key={`prev-${prev}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Image
            src={prevMovie.poster_url || prevMovie.thumb_url || ''}
            alt="" fill
            className="object-cover"
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
          <div className="hero-abs hero-grad-r" />
          <div className="hero-abs hero-grad-b" />
        </div>
      )}

      {/* ── Current bg (fading in) ── */}
      <div key={`curr-${current}`} className="hero-bg-curr" style={{ zIndex: 2 }}>
        {bg && (
          <Image
            src={bg}
            alt={movie.name || ''}
            fill
            className="object-cover"
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
        )}
        <div className="hero-abs hero-grad-r" />
        <div className="hero-abs hero-grad-b" />
      </div>

      {/* ── Content ── */}
      <div className="hero-abs" style={{ zIndex: 10, display: 'flex', alignItems: 'flex-end', paddingBottom: '7rem' }}>
        <div style={{ width: '100%', maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
          <div className="hero-content-in" key={`info-${current}`} style={{ maxWidth: '44rem' }}>

            <h1 className="hero-title">{(movie.name || '').toUpperCase()}</h1>

            {movie.origin_name && (
              <p className="hero-origin">{movie.origin_name}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {movie.year            && <span className="hero-pill">{movie.year}</span>}
              {movie.quality         && <span className="hero-qlty">{movie.quality}</span>}
              {movie.lang            && <span className="hero-pill">{movie.lang}</span>}
              {movie.episode_current && <span className="hero-pill">{movie.episode_current}</span>}
              {movie.time            && <span className="hero-pill">{movie.time}</span>}

            </div>

            {desc && <p className="hero-desc">{desc}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <Link href={`/movie/${movie.slug}`} className="hero-cta-play">
                <Play style={{ width: 18, height: 18, fill: 'white' }} /> Xem ngay
              </Link>
              <Link href={`/movie/${movie.slug}`} className="hero-cta-info">
                <Info style={{ width: 16, height: 16 }} /> Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip (desktop) ── */}
      {total > 1 && (
        <div className="hero-strip">
          <div className="hero-nav-col">
            <button
              onClick={() => goTo((currentRef.current - 1 + total) % total)}
              className="hero-nav-btn"
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={() => goTo((currentRef.current + 1) % total)}
              className="hero-nav-btn"
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>

          <div className="hero-thumbs">
            {featured.map((m, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`hero-thumb${i === current ? ' active' : ''}`}
              >
                <div className="hero-thumb-img">
                  {(m.thumb_url || m.poster_url) && (
                    <Image
                      src={m.thumb_url || m.poster_url}
                      alt={m.name || ''}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  )}
                  {i === current && (
                    <div className="hero-thumb-bar" style={{ width: `${progress}%` }} />
                  )}
                  <div className="hero-thumb-dim" />
                </div>
                <p className="hero-thumb-name">{m.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Dots (mobile) ── */}
      {total > 1 && (
        <div className="hero-dots">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`hero-dot${i === current ? ' active' : ''}`}
            />
          ))}
        </div>
      )}
      {/* ── Scroll indicator ── */}
      <div className="hero-scroll-hint">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-wheel" />
        </div>
        <span className="hero-scroll-text">Cuộn xuống</span>
      </div>

    </div>
  );
}
