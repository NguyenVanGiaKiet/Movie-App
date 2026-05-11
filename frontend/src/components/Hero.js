'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import TMDBInfo from './TMDBInfo';

const INTERVAL = 5000;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function Hero({ movies = [] }) {
  const featured = movies.slice(0, 20);
  const isMobile = useIsMobile();
  const total    = featured.length;

  const [current,     setCurrent]     = useState(0);
  const [prev,        setPrev]        = useState(null);
  const [progress,    setProgress]    = useState(0);
  const [dragging,    setDragging]    = useState(false);
  const [isVisible,   setIsVisible]   = useState(true);  // hero in viewport
  const [isTabActive,  setIsTabActive]  = useState(true);  // tab is active
  const [isLiked,     setIsLiked]     = useState(false);


  const rootRef       = useRef(null);
  const currentRef    = useRef(0);
  const prevRef       = useRef(0);
  const transitingRef = useRef(false);
  const timerRef      = useRef(null);
  const progRef       = useRef(null);
  const dragStart     = useRef(null);


  // ── Timer (restarts on current, visibility, or tab focus change) ──
  const startTimer = () => {
    clearInterval(progRef.current);
    clearTimeout(timerRef.current);
    if (total <= 1) return;
    const startTime = Date.now();
    setProgress(0);
    progRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTime) / INTERVAL) * 100, 100));
    }, 50);
    timerRef.current = setTimeout(() => {
      goTo((currentRef.current + 1) % total);
    }, INTERVAL);
  };

  const stopTimer = () => {
    clearInterval(progRef.current);
    clearTimeout(timerRef.current);
    setProgress(0);
  };

  const goTo = (idx) => {
    if (idx === currentRef.current) return;
    transitingRef.current = true;
    setPrev(currentRef.current);
    prevRef.current    = currentRef.current;
    currentRef.current = idx;
    setCurrent(idx);
    setProgress(0);
    setTimeout(() => { transitingRef.current = false; }, 700);
  };

  // Start/stop timer based on viewport visibility (keep trailer playing when switching tabs)
  useEffect(() => {
    if (isVisible) {
      startTimer();
    } else {
      stopTimer();
      // Stop timer when hero is scrolled out of viewport
    }
    return () => { clearInterval(progRef.current); clearTimeout(timerRef.current); };
  }, [current, total, isVisible]); // eslint-disable-line

  // ── Page Visibility API: track tab visibility ──
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabActive(!document.hidden);
      if (!document.hidden) {
        // Tab became visible again, restart timer if hero is in viewport
        if (isVisible) {
          startTimer();
        }
      } else {
        // Tab became hidden, just stop timer, keep trailer playing
        stopTimer();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isVisible]); // eslint-disable-line

  // ── IntersectionObserver: track viewport visibility ──
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }  // 20% visible = active
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  // Cleanup prev slide bg
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 750);
    return () => clearTimeout(t);
  }, [current]);

  // Keyboard nav
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  goTo((currentRef.current - 1 + total) % total);
      if (e.key === 'ArrowRight') goTo((currentRef.current + 1) % total);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [total]);

  // Drag/swipe
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

  const toggleLike = () => setIsLiked(v => !v);

  if (!total) return <div className="hero-root skeleton" />;

  const movie     = featured[current];
  const prevMovie = prev !== null ? featured[prev] : null;
  if (!movie) return null;

  const bg   = isMobile ? (movie.thumb_url || movie.poster_url || '') : (movie.poster_url || movie.thumb_url || '');
  const desc = (movie.content || movie.description || '').replace(/<[^>]*>/g, '').trim();

  // Create slots for thumbnail navigation (5 visible, centered on current)
  const slots = [];
  for (let i = -2; i <= 2; i++) {
    const idx = (current + i + total) % total;
    slots.push({ idx, offset: i });
  }

  return (
    <div
      ref={rootRef}
      className="hero-root"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={() => { setDragging(false); dragStart.current = null; }}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
    >
      {/* Prev bg */}
      {prevMovie && (
        <div key={`prev-${prev}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Image
            src={isMobile ? (prevMovie.thumb_url || prevMovie.poster_url || '') : (prevMovie.poster_url || prevMovie.thumb_url || '')}
            alt="" fill className="object-cover" style={{ objectFit: 'cover' }} priority unoptimized
          />
          <div className="hero-abs hero-grad-r" />
          <div className="hero-abs hero-grad-l" />
          <div className="hero-abs hero-grad-b" />
        </div>
      )}

      {/* Current bg */}
      <div key={`curr-${current}`} className="hero-bg-curr" style={{ zIndex: 2 }}>
        {bg && (
          <Image src={bg} alt={movie.name || ''} fill className="object-cover"
            style={{ objectFit: 'cover' }} priority unoptimized />
        )}
        <div className="hero-abs hero-grad-r" />
        <div className="hero-abs hero-grad-l" />
        <div className="hero-abs hero-grad-b" />
        <div className="hero-abs hero-grad-t" />
        <div className="hero-abs hero-grid-overlay" />
      </div>

      {/* Content */}
      <div className="hero-abs" style={{ zIndex: 10, display: 'flex', alignItems: 'flex-end', paddingBottom: '7rem' }}>
        <div style={{ width: '100%', maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
          <div className="hero-content-in hero-content-center" key={`info-${current}`} style={{ maxWidth: '44rem' }}>

            {movie.name_url ? (
              <div className="hero-name-image-container">
                <Image src={movie.name_url} alt={movie.name || ''} width={400} height={200}
                  className="object-contain"
                  style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '400px', maxHeight: '200px' }}
                  priority unoptimized />
              </div>
            ) : (
              <h1 className="hero-title">{(movie.name || '').toUpperCase()}</h1>
            )}

            {movie.origin_name && <p className="hero-origin">{movie.origin_name}</p>}
            {/* TMDB Score */}
            <TMDBInfo 
              movieName={movie.origin_name || movie.name} 
              year={movie.year ? parseInt(movie.year) : null}
              className="mb-4"
              showOnlyScore={true}
            />

            <div className="hero-info-container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {movie.year            && <span className="hero-pill">{movie.year}</span>}
              {movie.quality         && <span className="hero-qlty">{movie.quality}</span>}
              {movie.lang            && <span className="hero-pill">{movie.lang}</span>}
              {movie.episode_current && <span className="hero-pill">{movie.episode_current}</span>}
              {movie.time            && <span className="hero-pill">{movie.time}</span>}
            </div>

            {desc && <p className="hero-desc">{desc}</p>}

            <div className="hero-buttons-container" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <Link href={`/movie/${movie.slug}`} className="hero-cta-play hero-play-btn">
                <Play style={{ width: 18, height: 18, fill: 'white' }} /> <span className="btn-text">Xem ngay</span>
              </Link>
              <button onClick={toggleLike} className="hero-cta-info hero-like-btn"
                style={{ background: isLiked ? '#E50914' : 'rgba(255,255,255,0.1)' }}>
                <Heart style={{ width: 16, height: 16, fill: isLiked ? 'white' : 'none' }} />
                <span className="btn-text">{isLiked ? 'Đã thích' : 'Thích'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip (desktop): 5 visible, active always centred, infinite ── */}
      {total > 1 && (
        <div className="hero-strip">
          <div className="hero-thumbs" style={{ overflow: 'hidden', position: 'relative' }}>
            {/* Stable position-based keys so React never unmounts — transitions handle movement */}
            <div className="hero-thumbs-inner" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {slots.map(({ idx, offset }, posKey) => {
                const m        = featured[idx];
                const isActive = idx === current;
                const absDist  = Math.abs(offset);
                const scale    = isActive ? 1 : absDist === 1 ? 0.88 : 0.76;
                const opacity  = isActive ? 1 : absDist === 1 ? 0.65 : 0.4;
                return (
                  <button
                    key={`pos-${posKey}`}   /* fixed position key — no remount */
                    onClick={() => goTo(idx)}
                    className={`hero-thumb${isActive ? ' active' : ''}`}
                    style={{
                      transform: `scale(${scale})`,
                      opacity,
                      transition: 'transform .45s cubic-bezier(.25,.46,.45,.94), opacity .45s',
                      transformOrigin: 'bottom center',
                      flexShrink: 0,
                    }}
                  >
                    <div className="hero-thumb-img" style={{ transition: 'border-color .35s' }}>
                      {(m.thumb_url || m.poster_url) && (
                        <Image src={m.thumb_url || m.poster_url} alt={m.name || ''}
                          fill style={{ objectFit: 'cover', transition: 'opacity .3s' }} unoptimized />
                      )}
                      {isActive && <div className="hero-thumb-bar" style={{ width: `${progress}%` }} />}
                      <div className="hero-thumb-dim" />
                    </div>
                    <p className="hero-thumb-name">{m.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dots (mobile) */}
      {total > 1 && (
        <div className="hero-dots">
          {featured.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`hero-dot${i === current ? ' active' : ''}`} />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="hero-scroll-hint">
        <div className="hero-scroll-mouse"><div className="hero-scroll-wheel" /></div>
        <span className="hero-scroll-text">Cuộn xuống</span>
      </div>
    </div>
  );
}