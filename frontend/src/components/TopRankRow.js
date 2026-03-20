'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function TopRankRow({ title, movies = [], loading = false, linkHref = '#' }) {
  const router = useRouter();
  const items    = movies.slice(0, 10);
  const trackRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const isDrag   = useRef(false);
  const dragX    = useRef(0);
  const scrollB  = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);

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

  const onMD = (e) => { 
    if (e.button !== 0) return; 
    isDrag.current = true; 
    dragX.current = e.pageX; 
    scrollB.current = trackRef.current.scrollLeft; 
    setDragging(true); 
    setDragDistance(0);
    e.preventDefault(); 
  };
  const onMM = (e) => { 
    if (!isDrag.current) return; 
    const currentX = e.pageX;
    const distance = Math.abs(currentX - dragX.current);
    setDragDistance(distance);
    trackRef.current.scrollLeft = scrollB.current - (currentX - dragX.current); 
  };
  const onMU = () => { 
    isDrag.current = false; 
    setDragging(false); 
    setTimeout(() => setDragDistance(0), 100);
  };

  const handleItemClick = (e, slug) => {
    // Only navigate if not dragging
    if (dragDistance < 5) {
      router.push(`/movie/${slug}`);
    }
  };

  // Rank colors: single yellow fading from light to dark (10 to 1)
  const RANK_COLORS = [
    '#DC2626', // 1 - đậm nhất (vàng cam đậm)
    '#EA580C', // 2
    '#F97316', // 3
    '#EAB308', // 4
    '#84CC16', // 5
    '#22C55E', // 6
    '#14B8A6', // 7
    '#0EA5E9', // 8
    '#6366F1', // 9
    '#9333EA', // 10
  ];

  return (
    <section className="trr-root">
      <div className="trr-header">
        <h2 className="mr-title"><span className="mr-title-bar" />{title}</h2>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
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
                  <div key={m.slug || i} className="trr-item" onClick={(e) => handleItemClick(e, m.slug)} style={{'--rank-color': RANK_COLORS[i]}}>
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
                    
                  </div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
