'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { movieAPI, favoriteAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Play, Heart, Calendar, Film, Globe, Clock, ChevronDown, Server, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Comments from '@/components/Comments';
import StructuredData from '@/components/StructuredData';

function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  if (typeof val === 'object') return [val];
  return [];
}

function getName(val) {
  if (!val) return '';
  if (typeof val === 'object') return val.name || '';
  return String(val);
}

export default function MovieDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const playerRef = useRef(null);

  const [movie,        setMovie]        = useState(null);
  const [episodes,     setEpisodes]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isFavorite,   setIsFavorite]   = useState(false);
  const [favLoading,   setFavLoading]   = useState(false);
  const [selectedEp,   setSelectedEp]   = useState(null);
  const [activeServer, setActiveServer] = useState(0);
  const [playerSrc,    setPlayerSrc]    = useState('');
  const [showPlayer,   setShowPlayer]   = useState(false);
  const [showTrailer,  setShowTrailer]  = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieAPI.getMovieBySlug(slug);
        const movieData =
          res?.data?.movie ||
          res?.data?.film ||
          (typeof res?.data === 'object' && !Array.isArray(res?.data) ? res.data : null);
        setMovie(movieData || null);

        const eps = toArray(res?.data?.episodes || movieData?.episodes);
        setEpisodes(eps);

        // Không tự động load player khi vào trang
        // Chỉ load khi người dùng nhấn nút "Xem phim"
        if (movieData?.link_embed) {
          // Phim lẻ có link_embed → chỉ lưu lại, chưa hiện player
          setPlayerSrc(movieData.link_embed);
          setShowPlayer(false);
        } else {
          const firstEp = eps[0]?.server_data?.[0];
          if (firstEp) {
            setSelectedEp(firstEp);
            setPlayerSrc(firstEp.link_embed || firstEp.link_m3u8 || '');
            setShowPlayer(false); // chưa hiện player
          }
        }
      } catch (err) {
        console.error('Movie fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || !slug) return;
    favoriteAPI.checkFavorite(slug)
      .then(res => setIsFavorite(res?.data?.isFavorite || false))
      .catch(() => {});
  }, [slug, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để thêm vào yêu thích'); return; }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await favoriteAPI.removeFavorite(slug);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await favoriteAPI.addFavorite({
          movieSlug: slug,
          movieData: {
            name: movie?.name, origin_name: movie?.origin_name,
            thumb_url: movie?.thumb_url, poster_url: movie?.poster_url,
            year: movie?.year, episode_current: movie?.episode_current,
            quality: movie?.quality, lang: movie?.lang,
            category: toArray(movie?.category), type: movie?.type,
          },
        });
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (err) { toast.error(err.message); }
    finally { setFavLoading(false); }
  };

  const scrollToPlayer = () => {
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleWatchNow = () => {
    // Chỉ khi nhấn nút "Xem phim" mới hiện player
    setShowPlayer(true);
    scrollToPlayer();
  };

  const selectEpisode = (ep) => {
    const src = ep.link_embed || ep.link_m3u8 || '';
    setSelectedEp(ep);
    setPlayerSrc(src);
    setShowPlayer(true);
    scrollToPlayer();
  };

  // Thêm hàm để load server embed khi cần
  const loadEmbedServer = (src) => {
    setPlayerSrc(src);
    setShowPlayer(true);
    scrollToPlayer();
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen pt-16">
      <div className="h-[50vh] skeleton" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 skeleton rounded w-2/3" />
        <div className="h-4 skeleton rounded w-1/3" />
        <div className="h-24 skeleton rounded" />
      </div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-400 text-xl mb-4">Không tìm thấy phim</p>
        <Link href="/" className="btn-primary inline-flex px-6 py-2.5 rounded-full text-sm">Về trang chủ</Link>
      </div>
    </div>
  );

  const bg         = movie.poster_url || movie.thumb_url || '';
  const categories = toArray(movie.category);
  const countries  = toArray(movie.country);
  const directors  = toArray(movie.director);
  const actors     = toArray(movie.actor);
  const desc       = (movie.content || movie.description || '').replace(/<[^>]*>/g, '').trim();
  const hasVideo   = !!(movie.link_embed || playerSrc);
  const hasEpisodes = episodes.length > 0 && !movie.link_embed;

  return (
    <div className="min-h-screen page-enter">
      {/* Structured Data for SEO */}
      <StructuredData movie={movie} type="Movie" />

      {/* ── Hero backdrop ─────────────────────────────────────── */}
      <div className="detail-hero relative h-[55vh] overflow-hidden">
        {bg && <Image src={bg} alt={movie.name || ''} fill className="object-cover" priority quality={80} />}
        
        <div className="detail-grid-overlay absolute inset-0" />
        <div className="detail-grad-t" />
        <div className="detail-grad-b" />
        <div className="detail-grad-r" />
        <div className="detail-grad-l" />
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 detail-neg-mt relative z-10">
        <div className="flex flex-col sm:flex-row lg:flex-row gap-6 sm:gap-8">

          {/* Poster */}
          <div className="detail-poster-wrap flex-shrink-0 w-52 sm:w-60 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {bg ? (
                <>
                  <Image src={movie.thumb_url || bg} alt={movie.name || ''} fill className="object-cover" priority />
                  <div className="detail-poster-grid-overlay absolute inset-0" />
                </>
              ) : (
                <div className="w-full h-full bg-dark-card flex items-center justify-center">
                  <Film className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 text-center sm:text-left">
            <h1 className="detail-title font-display text-4xl sm:text-5xl text-white tracking-wide leading-none mb-1">
              {(movie.name || '').toUpperCase()}
            </h1>
            {movie.origin_name && (
              <p className="text-gray-400 text-base sm:text-lg mb-4">{movie.origin_name}</p>
            )}

            {/* Meta */}
            <div className="flex flex-col gap-2 mb-5 text-sm items-center sm:items-start">
              {/* Row 1: Year · Quality · Lang · Time */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
                {movie.year && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                    <span>{movie.year}</span>
                  </div>
                )}
                {movie.quality && (
                  <span className="px-2 py-0.5 bg-brand-red rounded text-white text-xs font-bold tracking-wide">{movie.quality}</span>
                )}
                {movie.lang && (
                  <span className="text-gray-300">{movie.lang}</span>
                )}
                {movie.time && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                    <span>{movie.time}</span>
                  </div>
                )}
              </div>
              {/* Row 2: Episodes · Country */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
                {movie.episode_current && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Film className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                    <span>{movie.episode_current}</span>
                  </div>
                )}
                {countries.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Globe className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                    <span>{countries.map(getName).join(', ')}</span>
                  </div>
                )}
              </div>
              {/* Row 3: Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  {categories.map((cat, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-sm border border-white/15 text-gray-400 bg-white/5 hover:border-brand-red/40 hover:text-white transition-colors">
                      {getName(cat)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {desc && (
              <div className="mb-6 max-w-2xl mx-auto sm:mx-0">
                <p className={`text-gray-300 text-sm leading-relaxed ${showFullDesc ? '' : 'line-clamp-3'}`}>
                  {desc}
                </p>
                {desc.length > 200 && (
                  <div className="flex justify-center mt-2">
                    <button onClick={() => setShowFullDesc(v => !v)}
                      className="flex items-center gap-1 text-xs text-brand-red hover:underline">
                      {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-6">
              {hasVideo && (
                <button onClick={handleWatchNow}
                  className="btn-primary flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold shadow-lg shadow-brand-red/30 hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-white" /> Xem phim ngay
                </button>
              )}
              {movie.trailer_url && (
                <button onClick={() => setShowTrailer(true)}
                  className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-all">
                  <Play className="w-4 h-4" /> Trailer
                </button>
              )}
              <button onClick={toggleFavorite} disabled={favLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  isFavorite ? 'bg-brand-red text-white' : 'btn-secondary'
                }`}>
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
            </div>

            {/* Cast */}
            {actors.length > 0 && (
              <p className="text-sm text-gray-400 mb-1 text-center sm:text-left">
                <span className="text-gray-500">Diễn viên: </span>
                {actors.slice(0, 6).map(getName).join(', ')}
              </p>
            )}
            {directors.length > 0 && (
              <p className="text-sm text-gray-400 text-center sm:text-left">
                <span className="text-gray-500">Đạo diễn: </span>
                {directors.map(getName).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ── VIDEO PLAYER ──────────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════════ */}
        {(hasVideo || hasEpisodes) && (
          <div ref={playerRef} className="mt-14 scroll-mt-20">

            <h2 className="player-heading">XEM PHIM</h2>

            {/* Server tabs */}
            {hasEpisodes && episodes.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {episodes.map((server, i) => (
                  <button key={i}
                    onClick={() => {
                      setActiveServer(i);
                      const ep = toArray(server.server_data)[0];
                      if (ep) selectEpisode(ep);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all ${
                      activeServer === i ? 'btn-primary' : 'btn-secondary'
                    }`}>
                    <Server className="w-3.5 h-3.5" />
                    {server.server_name || `Server ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Episode buttons */}
            {hasEpisodes && (() => {
              const serverData = toArray(episodes[activeServer]?.server_data);
              if (serverData.length === 0) return null;
              return (
                <div className="mb-5">
                  {serverData.length > 1 && (
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-medium">Danh sách tập</p>
                  )}
                  <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2" style={{maxHeight: "9rem", overflowY: "auto", paddingRight: "4px"}}>
                    {serverData.map((ep, i) => (
                      <button key={i} onClick={() => selectEpisode(ep)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedEp?.name === ep.name
                            ? 'bg-brand-red text-white shadow-md shadow-brand-red/30'
                            : 'glass text-gray-300 hover:bg-white/20'
                        }`}>
                        {ep.name || `Tập ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Iframe player ── */}
            {showPlayer && playerSrc ? (
              <div className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10"
                style={{ aspectRatio: '16/9', position: 'relative' }}>
                <iframe
                  key={playerSrc}
                  src={playerSrc}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title={selectedEp?.name || movie.name || 'Video'}
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              /* Click-to-play thumbnail */
              <div
                className="relative rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 cursor-pointer group"
                style={{ aspectRatio: '16/9' }}
                onClick={handleWatchNow}>
                {bg && <Image src={bg} alt="" fill className="object-cover opacity-40 group-hover:opacity-55 transition-opacity" />}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-brand-red flex items-center justify-center shadow-2xl shadow-brand-red/50 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                  <p className="text-white/70 text-sm font-medium">Nhấn để bắt đầu xem</p>
                </div>
              </div>
            )}

            {/* Đang xem label */}
            {showPlayer && selectedEp && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                Đang xem: <span className="text-white font-medium">{movie.name}</span>
                {selectedEp.name && selectedEp.name !== 'Full' && (
                  <> — <span className="text-brand-red font-semibold">{selectedEp.name}</span></>
                )}
              </div>
            )}
          </div>
        )}

        <div className="h-16" />
      </div>

      {/* ── Comments ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Comments slug={slug} />
      </div>

      {/* ── Trailer modal ─────────────────────────────────────── */}
      {showTrailer && movie.trailer_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">
                🎬 Trailer — <span className="text-gray-300">{movie.name}</span>
              </p>
              <button onClick={() => setShowTrailer(false)}
                className="p-1.5 rounded-full glass hover:bg-white/20 transition-colors text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl"
              style={{ aspectRatio: '16/9', position: 'relative' }}>
              <iframe
                src={movie.trailer_url}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={`Trailer — ${movie.name}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
