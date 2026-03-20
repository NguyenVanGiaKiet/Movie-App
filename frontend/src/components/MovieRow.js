'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

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

export default function NewMovieRow({ title, movies = [], loading = false, linkHref = '#' }) {
  const router = useRouter();
  const items    = movies.slice(0, 10);
  const trackRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const isDrag  = useRef(false);
  const dragX   = useRef(0);
  const scrollB = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);

  const updateArrows = useCallback(() => {
    const el = trackRef.current; if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // Handle scroll events to disable clicks
  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    updateArrows();
    
    // Clear previous timeout
    if (window.scrollTimeout) {
      clearTimeout(window.scrollTimeout);
    }
    
    // Re-enable clicks after scroll ends
    window.scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [updateArrows]);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    const ro = new ResizeObserver(updateArrows); ro.observe(el);
    return () => { 
      el.removeEventListener('scroll', handleScroll); 
      ro.disconnect(); 
    };
  }, [updateArrows, handleScroll]);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const r = requestAnimationFrame(() => { el.scrollLeft = 0; requestAnimationFrame(updateArrows); });
    return () => cancelAnimationFrame(r);
  }, [loading, items.length, updateArrows]);

  const doScroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: dir === 'l' ? -500 : 500, behavior: 'smooth' });
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
    // Only navigate if not dragging and not scrolling
    if (dragDistance < 5 && !isScrolling) {
      router.push(`/movie/${slug}`);
    }
  };

  return (
    <section className="mr-root">
      <div className="mr-header">
        <h2 className="mr-title"><span className="mr-title-bar"/>{title}</h2>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',gap:5}} className="mr-nav-container">
            <button className="mr-nav-btn mr-nav-btn" onClick={()=>doScroll('l')} disabled={!canL}><ChevronLeft style={{width:15,height:15}}/></button>
            <button className="mr-nav-btn mr-nav-btn" onClick={()=>doScroll('r')} disabled={!canR}><ChevronRight style={{width:15,height:15}}/></button>
          </div>
        </div>
      </div>

      <div className="mr-scroll-wrap">
        {canL && <div className="mr-fade-l"/>}
        {canR && <div className="mr-fade-r"/>}
        <div
          ref={trackRef}
          className="mr-track"
          style={{cursor: dragging?'grabbing':'grab', userSelect:'none'}}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        >
          {loading
            ? Array.from({length:8}).map((_,i)=>(
                <div key={i} className="mr-item">
                  <div className="mr-poster skeleton"/>
                  <div style={{padding:'10px 2px 0'}}>
                    <div className="skeleton" style={{height:32,width:28,borderRadius:3,marginBottom:8}}/>
                    <div className="skeleton" style={{height:13,width:'90%',borderRadius:3,marginBottom:5}}/>
                    <div className="skeleton" style={{height:10,width:'65%',borderRadius:3}}/>
                  </div>
                </div>
              ))
            : items.map((m,i)=>{
                const thumb = m.thumb_url || m.poster_url || '';
                const color = RANK_COLORS[i] || '#555';
                const ep    = m.episode_current || '';
                return (
                  <div key={m.slug||i} className="mr-item" onClick={(e) => handleItemClick(e, m.slug)} style={{'--rank-color': color}}>
                        {/* ── Poster ── */}
                        <div className="mr-poster group">

                            {thumb
                                ? <Image
                                    src={thumb}
                                    alt={m.name || ''}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="mr-img"
                                    unoptimized
                                />
                                : <div className="mr-fallback" />
                            }

                            {/* Hover overlay */}
                            <div className="mr-hover-ov">
                                <div className="mr-play-btn">
                                    <Play style={{ width: 22, height: 22, fill: 'white', color: 'white', marginLeft: 3 }} />
                                </div>
                            </div>

                        </div>

                    {/* ── Info below ── */}
                    <div className="mr-info">
                      {/* Big rank number */}
                      <div className="mr-rank" style={{
                        WebkitTextStroke: `2px ${color}`,
                        WebkitTextFillColor: 'transparent',
                        color,
                      }}>{i+1}</div>

                      {/* Movie details in horizontal row */}
                      <div className="mr-details">
                        <p className="mr-name">{m.name}</p>

                        {m.origin_name && (
                          <p className="mr-origin">{m.origin_name}</p>
                        )}

                        
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}