'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_LABELS = { 'phim-le':'Phim lẻ','phim-bo':'Phim bộ','tv-shows':'TV Shows','hoat-hinh':'Hoạt hình' };

function MovieList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/');
  }, [user, authLoading]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listMovies({ page, limit: LIMIT, search: search || undefined });
      setMovies(res?.data?.items || []);
      setTotal(res?.data?.paginate?.total_items || 0);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(); }, [page, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const toggleShow = async (movie) => {
    try {
      await adminAPI.updateMovie(movie._id, { is_shown: !movie.is_shown });
      setMovies(ms => ms.map(m => m._id === movie._id ? { ...m, is_shown: !m.is_shown } : m));
      toast.success(movie.is_shown ? 'Đã ẩn phim' : 'Đã hiện phim');
    } catch (e) { toast.error(e.message); }
  };

  const deleteMovie = async (id, name) => {
    if (!confirm(`Xóa phim "${name}"?`)) return;
    try {
      await adminAPI.deleteMovie(id);
      setMovies(ms => ms.filter(m => m._id !== id));
      toast.success('Đã xóa phim');
    } catch (e) { toast.error(e.message); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">DANH SÁCH PHIM</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng: {total} phim</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="btn-secondary px-4 py-2 rounded-xl text-sm">← Dashboard</Link>
          <Link href="/admin/movies/new" className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" /> Thêm phim
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm tên phim..."
            className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </form>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Tên phim</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Loại</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Năm</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Chất lượng</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Lượt xem</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Loader className="w-6 h-6 animate-spin text-brand-red mx-auto" />
                </td></tr>
              ) : movies.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-500">
                  <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />Không có phim nào
                </td></tr>
              ) : movies.map((m) => (
                <tr key={m._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium line-clamp-1">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.origin_name}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-300">
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400">{m.year}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-red/20 text-brand-red font-medium">{m.quality}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{m.view?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleShow(m)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${m.is_shown ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                      {m.is_shown ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {m.is_shown ? 'Hiện' : 'Ẩn'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/movies/${m._id}/episodes`}
                        className="p-1.5 rounded-lg glass hover:bg-white/20 text-blue-400 transition-colors" title="Quản lý tập phim">
                        <Film className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/movies/${m._id}`}
                        className="p-1.5 rounded-lg glass hover:bg-white/20 text-yellow-400 transition-colors" title="Sửa">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteMovie(m._id, m.name)}
                        className="p-1.5 rounded-lg glass hover:bg-white/20 text-red-400 transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-sm text-gray-400">Trang {page}/{totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 glass rounded-lg disabled:opacity-40 hover:bg-white/20">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-1.5 glass rounded-lg disabled:opacity-40 hover:bg-white/20">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMoviesPage() {
  return <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white">Đang tải...</div>}><MovieList /></Suspense>;
}
