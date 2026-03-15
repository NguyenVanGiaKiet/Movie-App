'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard, { MovieCardSkeleton } from './MovieCard';

export default function MovieRow({ title, movies = [], loading = false, error = null }) {
  const rowRef     = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollBase = useRef(0);
  const [dragging, setDragging] = useState(false);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 2);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // Reset scroll + check arrows after content loads
  useEffect(() => {
    const el = rowRef.current;
    if (!el || loading) return;
    // Wait for DOM to paint
    const raf = requestAnimationFrame(() => {
      el.scrollLeft = 0;
      requestAnimationFrame(() => updateArrows());
    });
    return () => cancelAnimationFrame(raf);
  }, [loading, movies.length, updateArrows]);

  // Watch for resize (e.g. window resize changes clientWidth)
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateArrows());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateArrows]);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    // Poll a few times after scroll to catch exact end
    [100, 200, 350, 500].forEach(ms => setTimeout(updateArrows, ms));
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
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className="mr-nav-btn"
            aria-label="Cuộn trái"
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className="mr-nav-btn"
            aria-label="Cuộn phải"
          >
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
            : movies.map((m, i) => <MovieCard key={m.slug || i} movie={m} priority={i < 4} />)
          }
        </div>
      </div>
    </section>
  );
}
