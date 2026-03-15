'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const RANK_COLORS = ['#E50914','#ff6000','#ffa500','#aaa','#888','#777','#666','#666','#555','#555'];

export default function TopRankRow({ title, movies = [], loading = false, linkHref = '#' }) {
  const items    = movies.slice(0, 10);
  const trackRef = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const isDrag  = useRef(false);
  const dragX   = useRef(0);
  const scrollB = useRef(0);
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
    el.scrollBy({ left: dir === 'l' ? -500 : 500, behavior: 'smooth' });
    [150, 350, 550].forEach(ms => setTimeout(updateArrows, ms));
  };

  const onMD = (e) => { if (e.button !== 0) return; isDrag.current = true; dragX.current = e.pageX; scrollB.current = trackRef.current.scrollLeft; setDragging(true); e.preventDefault(); };
  const onMM = (e) => { if (!isDrag.current) return; trackRef.current.scrollLeft = scrollB.current - (e.pageX - dragX.current); };
  const onMU = () => { isDrag.current = false; setDragging(false); };

  return (
    <section className="nmr-root">
      <div className="nmr-header">
        <h2 className="mr-title"><span className="mr-title-bar"/>{title}</h2>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href={linkHref} className="nmr-see-all">Xem tất cả →</Link>
          <div style={{display:'flex',gap:5}}>
            <button className="mr-nav-btn" onClick={()=>doScroll('l')} disabled={!canL}><ChevronLeft style={{width:15,height:15}}/></button>
            <button className="mr-nav-btn" onClick={()=>doScroll('r')} disabled={!canR}><ChevronRight style={{width:15,height:15}}/></button>
          </div>
        </div>
      </div>

      <div className="nmr-scroll-wrap">
        {canL && <div className="nmr-fade-l"/>}
        {canR && <div className="nmr-fade-r"/>}
        <div
          ref={trackRef}
          className="nmr-track"
          style={{cursor: dragging?'grabbing':'grab', userSelect:'none'}}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        >
          {loading
            ? Array.from({length:8}).map((_,i)=>(
                <div key={i} className="nmr-item">
                  <div className="nmr-poster skeleton"/>
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
                  <Link key={m.slug||i} href={`/movie/${m.slug}`} className="nmr-item">

                        {/* ── Poster ── */}
                        <div className="nmr-poster group">

                            {thumb
                                ? <Image
                                    src={thumb}
                                    alt={m.name || ''}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="nmr-img"
                                    unoptimized
                                />
                                : <div className="nmr-fallback" />
                            }

                            {/* Hover overlay */}
                            <div className="nmr-hover-ov">
                                <div className="nmr-play-btn">
                                    <Play style={{ width: 22, height: 22, fill: 'white', color: 'white', marginLeft: 3 }} />
                                </div>
                            </div>

                        </div>

                    {/* ── Info below ── */}
                    <div className="nmr-info">
                      {/* Big rank number */}
                      <div className="nmr-rank" style={{
                        WebkitTextStroke: `2px ${color}`,
                        WebkitTextFillColor: 'transparent',
                        color,
                      }}>{i+1}</div>

                      {/* Movie details in horizontal row */}
                      <div className="nmr-details">
                        <p className="nmr-name">{m.name}</p>

                        {m.origin_name && (
                          <p className="nmr-origin">{m.origin_name}</p>
                        )}

                        {/* Meta row */}
                        {(m.year || ep) && (
                          <div className="nmr-meta">
                            {m.year && <span>{m.year}</span>}
                            {m.year && ep && <span className="nmr-sep">•</span>}
                            {ep && <span>{ep}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}