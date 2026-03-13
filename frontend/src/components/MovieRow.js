'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard, { MovieCardSkeleton } from './MovieCard';

export default function MovieRow({ title, movies = [], loading = false, error = null }) {
  const rowRef     = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollBase = useRef(0);
  const [dragging, setDragging] = useState(false);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  // Force scroll to 0 after hydration (beat browser scroll-restoration)
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    const raf = requestAnimationFrame(() => {
      el.scrollLeft = 0;
      updateArrows();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75, behavior: 'smooth' });
    setTimeout(updateArrows, 420);
  };

  /* ── Drag / mouse ── */
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    startX.current     = e.pageX;
    scrollBase.current = rowRef.current.scrollLeft;
    setDragging(true);
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    rowRef.current.scrollLeft = scrollBase.current - (e.pageX - startX.current);
    updateArrows();
  };
  const onMouseUp = () => { isDragging.current = false; setDragging(false); };

  /* ── Touch ── */
  const onTouchStart = (e) => {
    startX.current     = e.touches[0].pageX;
    scrollBase.current = rowRef.current.scrollLeft;
  };
  const onTouchMove = (e) => {
    rowRef.current.scrollLeft = scrollBase.current - (e.touches[0].pageX - startX.current);
    updateArrows();
  };

  return (
    <section className="mr-root">
      <div className="mr-header">
        <h2 className="mr-title">
          <span className="mr-title-bar" />
          {title}
        </h2>
        <div className="mr-nav">
          <button onClick={() => scroll('left')} disabled={!canLeft} className="mr-nav-btn" aria-label="Cuộn trái">
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight} className="mr-nav-btn" aria-label="Cuộn phải">
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      <div className="mr-scroll-wrap">
        {canLeft  && <div className="mr-fade-left"  />}
        {canRight && <div className="mr-fade-right" />}
        <div
          ref={rowRef}
          className="mr-track"
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onScroll={updateArrows}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : error
            ? <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, padding: '16px 0' }}>Không thể tải phim.</p>
            : movies.map((m, i) => <MovieCard key={m.slug || i} movie={m} />)
          }
        </div>
      </div>
    </section>
  );
}
