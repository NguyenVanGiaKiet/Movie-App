'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TopRankRow({ title, movies = [], loading = false, linkHref = '#' }) {
  const items    = movies.slice(0, 10);
  const trackRef = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const isDrag   = useRef(false);
  const dragX    = useRef(0);
  const scrollB  = useRef(0);
  const [dragging, setDragging] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current; if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows); ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const r = requestAnimationFrame(() => { el.scrollLeft = 0; requestAnimationFrame(updateArrows); });
    return () => cancelAnimationFrame(r);
  }, [loading, items.length, updateArrows]);

  const doScroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: dir === 'l' ? -480 : 480, behavior: 'smooth' });
    [150, 350, 550].forEach(ms => setTimeout(updateArrows, ms));
  };

  const onMD = (e) => { if (e.button !== 0) return; isDrag.current = true; dragX.current = e.pageX; scrollB.current = trackRef.current.scrollLeft; setDragging(true); e.preventDefault(); };
  const onMM = (e) => { if (!isDrag.current) return; trackRef.current.scrollLeft = scrollB.current - (e.pageX - dragX.current); };
  const onMU = () => { isDrag.current = false; setDragging(false); };

  // Rank colors: top 3 glow, rest grey
  const RANK_COLORS = ['#E50914','#ff6000','#ffaa00','#aaaaaa','#888888','#777777','#666666','#666666','#666666','#666666'];

  return (
    <section className="trr-root">
      <div className="trr-header">
        <h2 className="mr-title"><span className="mr-title-bar" />{title}</h2>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link href={linkHref} className="trr-see-all">Xem tất cả →</Link>
          <div style={{ display:'flex', gap:5 }}>
            <button className="mr-nav-btn" onClick={() => doScroll('l')} disabled={!canL}><ChevronLeft style={{width:15,height:15}}/></button>
            <button className="mr-nav-btn" onClick={() => doScroll('r')} disabled={!canR}><ChevronRight style={{width:15,height:15}}/></button>
          </div>
        </div>
      </div>

      <div className="trr-scroll-wrap">
        {canL && <div className="trr-fade-l" />}
        {canR && <div className="trr-fade-r" />}
        <div
          ref={trackRef}
          className="trr-track"
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="trr-item">
                  <div className="trr-rank skeleton" style={{ width:56, height:80, borderRadius:4 }} />
                  <div className="trr-poster skeleton" />
                </div>
              ))
            : items.map((m, i) => {
                const thumb = m.thumb_url || m.poster_url || '';
                return (
                  <Link key={m.slug || i} href={`/movie/${m.slug}`} className="trr-item">
                    {/* Row: number + poster */}
                    <div className="trr-row">
                      <span className="trr-rank" style={{ color: RANK_COLORS[i] }}>{i + 1}</span>
                      <div className="trr-poster">
                        {thumb
                          ? <Image src={thumb} alt={m.name||''} fill style={{objectFit:'cover'}} unoptimized />
                          : <div className="trr-fallback" />
                        }
                        <div className="trr-hover-ov">
                          <div className="trr-play">
                            <Play style={{width:20,height:20,fill:'white',color:'white',marginLeft:2}}/>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Info below */}
                    <p className="trr-name">{m.name}</p>
                    {m.origin_name && (
                      <p className="trr-origin">{m.origin_name}</p>
                    )}
                    {m.episode_current && <p className="trr-ep-text">{m.episode_current}</p>}
                  </Link>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
