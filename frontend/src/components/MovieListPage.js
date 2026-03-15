'use client';

import { useState, useEffect, useMemo } from 'react';
import MovieCard, { MovieCardSkeleton } from '@/components/MovieCard';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';

function extractItems(res) {
  const d = res?.data;
  return d?.items || d?.movies || d?.data || [];
}

// Mobile: 5 hàng × 2 cột = 10 card/trang
const MOBILE_PER_PAGE = 10;

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

export default function MovieListPage({ fetchFn, title, description, accentColor = '#E50914' }) {
  const [allMovies,  setAllMovies]  = useState([]);   // tất cả phim đã fetch
  const [loading,    setLoading]    = useState(true);
  const [apiPage,    setApiPage]    = useState(1);     // trang API
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [error,      setError]      = useState('');

  // Mobile client-side pagination
  const isMobile   = useIsMobile();
  const [mobPage,  setMobPage]   = useState(1);

  // Tổng số trang trên mobile (dựa trên allMovies đã có)
  const mobTotalPages = useMemo(
    () => Math.ceil(allMovies.length / MOBILE_PER_PAGE),
    [allMovies.length]
  );

  // Cards hiển thị
  const displayMovies = useMemo(() => {
    if (!isMobile) return allMovies;
    const start = (mobPage - 1) * MOBILE_PER_PAGE;
    return allMovies.slice(start, start + MOBILE_PER_PAGE);
  }, [isMobile, allMovies, mobPage]);

  // Fetch từ API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchFn(apiPage);
        const items = extractItems(res);
        const tp = res?.data?.paginate?.total_page || res?.data?.totalPages || 1;
        const tt = res?.data?.paginate?.total_items || res?.data?.total || 0;
        setAllMovies(items);
        setTotalPages(tp);
        setTotal(tt);
        setMobPage(1); // reset mobile page khi đổi API page
      } catch {
        setError('Không thể tải danh sách phim. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiPage]);

  const handlePageChange = (p) => {
    if (isMobile) {
      setMobPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setApiPage(p);
    }
  };

  // Trang hiện tại và tổng trang để render pagination
  const currentPage = isMobile ? mobPage    : apiPage;
  const pages       = isMobile ? mobTotalPages : totalPages;
  const isFirstPage = currentPage === 1;
  const isLastPage  = currentPage >= pages;

  return (
    <div className="mlp-root page-enter">

      {/* Header */}
      <div className="mlp-header" style={{ '--accent': accentColor }}>
        <div className="mlp-header-inner">
          <div className="mlp-title-wrap">
            <span className="mlp-accent-bar" style={{ background: accentColor }} />
            <div>
              <h1 className="mlp-title">{title.toUpperCase()}</h1>
              {description && <p className="mlp-desc">{description}</p>}
            </div>
          </div>
          {total > 0 && (
            <span className="mlp-count">{total.toLocaleString()} phim</span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mlp-content">
        {error && <div className="mlp-error">{error}</div>}

        <div className="mlp-grid">
          {loading
            ? Array.from({ length: isMobile ? MOBILE_PER_PAGE : 24 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            : displayMovies.map((m, i) => (
                <MovieCard key={m.slug || i} movie={m} className="w-full" priority={i < 6} />
              ))
          }
        </div>

        {!loading && displayMovies.length === 0 && !error && (
          <div className="mlp-empty">
            <Film style={{ width: 56, height: 56, color: 'rgba(255,255,255,.15)', marginBottom: 16 }} />
            <p>Không có phim nào trong danh mục này</p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="mlp-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={isFirstPage}
              className="mlp-page-btn"
            >
              <ChevronLeft style={{ width: 16, height: 16 }} /> Trước
            </button>

            <div className="mlp-page-nums">
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                let p;
                if (pages <= 7)          p = i + 1;
                else if (currentPage <= 4)        p = i + 1;
                else if (currentPage >= pages - 3) p = pages - 6 + i;
                else                              p = currentPage - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`mlp-page-num${p === currentPage ? ' active' : ''}`}
                    style={p === currentPage ? { background: accentColor, borderColor: accentColor } : {}}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isLastPage}
              className="mlp-page-btn"
            >
              Sau <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}