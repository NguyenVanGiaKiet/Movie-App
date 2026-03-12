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

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [suggestions,   setSuggestions]   = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [showSuggest,   setShowSuggest]   = useState(false);

  const searchRef   = useRef(null);
  const debouncedQ  = useDebounce(searchQuery, 350);

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
    { href: '/movies/type/phim-le', label: 'Phim lẻ' },
    { href: '/movies/type/phim-bo', label: 'Phim bộ' },
    { href: '/movies/type/hoat-hinh', label: 'Hoạt hình' },
    { href: '/movies/type/tv-shows', label: 'TV Shows' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-2xl' : 'bg-gradient-to-b from-black/90 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Film className="w-7 h-7 text-brand-red" />
            <span className="font-display text-2xl tracking-widest text-white group-hover:text-brand-red transition-colors">
              CINESTREAM
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-brand-red' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">

            {/* ── Desktop Search with Live Suggestions ── */}
            <div ref={searchRef} className="hidden sm:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                    placeholder="Tìm kiếm phim..."
                    className="input-dark w-44 lg:w-60 pl-9 pr-8 py-1.5 rounded-full text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  {searching && (
                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 animate-spin" />
                  )}
                  {!searching && searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggest(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions dropdown */}
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-80 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                  <div className="py-2">
                    {suggestions.map((movie, i) => {
                      const thumb = movie.thumb_url || movie.poster_url || '';
                      const year  = extractYear(movie);
                      const cats  = Array.isArray(movie.category)
                        ? movie.category.slice(0, 2).map(c => c?.name || c).join(', ')
                        : '';
                      return (
                        <button
                          key={movie.slug || i}
                          onClick={() => handleSuggestionClick(movie.slug)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                        >
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-[#2a2a35] relative">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={movie.name || ''}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{movie.name}</p>
                            {movie.origin_name && (
                              <p className="text-xs text-gray-500 truncate">{movie.origin_name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              {year && (
                                <span className="text-xs text-brand-red font-semibold">{year}</span>
                              )}
                              {movie.quality && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-medium">
                                  {movie.quality}
                                </span>
                              )}
                              {cats && (
                                <span className="text-xs text-gray-500 truncate">{cats}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* View all results */}
                  <div className="border-t border-white/10">
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-2.5 text-xs text-brand-red hover:bg-white/10 transition-colors font-medium flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Xem tất cả kết quả cho "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth section */}
            {isAuthenticated ? (
              <>
                <Link href="/favorites" className="p-2 text-gray-300 hover:text-brand-red transition-colors" title="Yêu thích">
                  <Heart className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
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
                <Link href="/login" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn-primary px-4 py-1.5 rounded-full text-sm">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-300 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-slide-up">
            {/* Mobile search */}
            <div ref={searchRef} className="mb-4 relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                    placeholder="Tìm kiếm phim..."
                    className="input-dark w-full pl-9 pr-8 py-2.5 rounded-full text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  {searching && (
                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
                  )}
                </div>
              </form>

              {/* Mobile suggestions */}
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50 animate-scale-in">
                  {suggestions.map((movie, i) => {
                    const thumb = movie.thumb_url || movie.poster_url || '';
                    const year  = extractYear(movie);
                    return (
                      <button
                        key={movie.slug || i}
                        onClick={() => handleSuggestionClick(movie.slug)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-9 h-12 rounded overflow-hidden bg-[#2a2a35] relative">
                          {thumb && (
                            <Image src={thumb} alt={movie.name || ''} fill className="object-cover" sizes="36px" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{movie.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {year && <span className="text-xs text-brand-red font-semibold">{year}</span>}
                            {movie.quality && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{movie.quality}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <div className="border-t border-white/10">
                    <button onClick={handleSearch} className="w-full px-4 py-2.5 text-xs text-brand-red hover:bg-white/10 transition-colors font-medium">
                      Xem tất cả kết quả →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link href="/login" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">Đăng nhập</Link>
                  <Link href="/register" className="block px-3 py-2 text-sm text-brand-red font-medium hover:bg-white/10 rounded-lg">Đăng ký</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
