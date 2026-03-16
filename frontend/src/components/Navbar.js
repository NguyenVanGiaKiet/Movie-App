'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { movieAPI } from '@/lib/api';
import { Search, Heart, LogOut, Menu, X, Film, Loader, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function extractYear(movie) {
  const v = movie?.year || movie?.release_year;
  if (v && String(v).match(/^\d{4}$/)) return String(v);
  return '';
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const searchRef = useRef(null);
  const debouncedQ = useDebounce(searchQuery, 350);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setShowSuggest(false); }, [pathname]);

  // Click outside to close suggestions
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live search when debounced query changes
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    const doSearch = async () => {
      setSearching(true);
      try {
        const res = await movieAPI.searchMovies(debouncedQ, 1);
        const items = res?.data?.items || res?.data?.movies || res?.data?.data || [];
        setSuggestions(items.slice(0, 6));
        setShowSuggest(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    };
    doSearch();
  }, [debouncedQ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggest(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (slug) => {
    setShowSuggest(false);
    setSearchQuery('');
    router.push(`/movie/${slug}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    router.push('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/phim-le', label: 'Phim lẻ' },
    { href: '/phim-bo', label: 'Phim bộ' },
    { href: '/hoat-hinh', label: 'Hoạt hình' },
    { href: '/tv-shows', label: 'TV Shows' },
  ];

  // Navbar background: solid dark when menu open, else scroll-based
  const navStyle = mobileOpen
    ? {
        background: 'rgba(10,10,15,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.2s ease',
      }
    : {
        background: scrolled ? 'rgba(10,10,15,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease',
      };

  return (
    <>
      <nav className="fixed top-0 w-full z-50" style={navStyle}>
        <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <Film className="w-10 h-10 text-brand-red" />
              <div className="flex flex-col">
                <span className="nav-logo-text font-display text-xl tracking-widest text-white group-hover:text-brand-red transition-colors">
                  HOPPHIM
                </span>
                <span className="text-xs text-gray-400">Phim hay cả hộp</span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href ? 'text-brand-red' : 'text-gray-300 hover:text-white'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">

              {/* Desktop Search */}
              <div ref={searchRef} className="hidden sm:block relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input type="text" value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                      placeholder="Tìm kiếm phim..."
                      className="input-dark w-44 lg:w-60 pl-9 pr-8 py-1.5 rounded-full text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    {searching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 animate-spin" />}
                    {!searching && searchQuery && (
                      <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggest(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </form>
                {showSuggest && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-80 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                    <div className="py-2">
                      {suggestions.map((movie, i) => {
                        const thumb = movie.thumb_url || movie.poster_url || '';
                        const year  = extractYear(movie);
                        const cats  = Array.isArray(movie.category) ? movie.category.slice(0, 2).map(c => c?.name || c).join(', ') : '';
                        return (
                          <button key={movie.slug || i} onClick={() => handleSuggestionClick(movie.slug)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left">
                            <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-[#2a2a35] relative">
                              {thumb ? <Image src={thumb} alt={movie.name || ''} fill className="object-cover" sizes="40px" unoptimized />
                                : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-gray-600" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{movie.name}</p>
                              {movie.origin_name && <p className="text-xs text-gray-500 truncate">{movie.origin_name}</p>}
                              <div className="flex items-center gap-2 mt-0.5">
                                {year && <span className="text-xs text-brand-red font-semibold">{year}</span>}
                                {movie.quality && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-medium">{movie.quality}</span>}
                                {cats && <span className="text-xs text-gray-500 truncate">{cats}</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10">
                      <button onClick={handleSearch}
                        className="w-full px-4 py-2.5 text-xs text-brand-red hover:bg-white/10 transition-colors font-medium flex items-center justify-center gap-1.5">
                        <Search className="w-3.5 h-3.5" />
                        Xem tất cả kết quả cho "{searchQuery}"
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Auth */}
              {isAuthenticated ? (
                <>
                  <Link href="/favorites" className="p-2 text-gray-300 hover:text-brand-red transition-colors" title="Yêu thích">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link href="/favorites" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors" onClick={() => setDropdownOpen(false)}>
                          <Heart className="w-4 h-4" /> Yêu thích
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">Đăng nhập</Link>
                  <Link href="/register" className="btn-primary px-4 py-1.5 rounded-full text-sm">Đăng ký</Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button className="md:hidden p-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile backdrop — dims page content ── */}
      {mobileOpen && (
        <div
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, top: 64,
            zIndex: 48,
            background: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn .18s ease',
          }}
        />
      )}

      {/* ── Mobile menu — fixed overlay, no scroll ── */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed', top: 64, left: 0, right: 0,
            zIndex: 49,
            background: 'rgba(10,10,15,0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            padding: '12px 16px 16px',
            overflow: 'hidden',
            animation: 'slideDown .18s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {/* Search */}
          <div ref={searchRef} style={{ marginBottom: 10, position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <div style={{ position: 'relative' }}>
                <input type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Tìm kiếm phim..."
                  className="input-dark"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 32, paddingTop: 9, paddingBottom: 9, borderRadius: 999, fontSize: 14 }}
                />
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                {searching && <Loader style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.35)' }} />}
              </div>
            </form>
            {showSuggest && suggestions.length > 0 && (
              <div style={{ marginTop: 8, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,10,15,0.72)', backdropFilter: 'blur(16px)' }}>
                {suggestions.map((movie, i) => {
                  const thumb = movie.thumb_url || movie.poster_url || '';
                  const year  = extractYear(movie);
                  return (
                    <button key={movie.slug || i} onClick={() => handleSuggestionClick(movie.slug)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ flexShrink: 0, width: 36, height: 48, borderRadius: 6, overflow: 'hidden', background: '#2A2A38', position: 'relative' }}>
                        {thumb && <Image src={thumb} alt="" fill style={{ objectFit: 'cover' }} sizes="36px" unoptimized />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.name}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          {year && <span style={{ fontSize: 11, color: '#E50914', fontWeight: 600 }}>{year}</span>}
                          {movie.quality && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>{movie.quality}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={handleSearch} style={{ width: '100%', padding: 10, fontSize: 12, color: '#E50914', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    Xem tất cả kết quả →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 8 }} />

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 15, fontWeight: 400,
                  color: 'rgba(255,255,255,0.75)',
                  background: isActive ? 'rgba(229,9,20,0.15)' : 'transparent',
                }}>
                  {link.label}

                </Link>
              );
            })}
          </div>

          {/* Auth */}
          {!isAuthenticated && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 10, paddingTop: 10, display: 'flex', gap: 8 }}>
              <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}>Đăng nhập</Link>
              <Link href="/register" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', background: '#E50914', textDecoration: 'none' }}>Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}