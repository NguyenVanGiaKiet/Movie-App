'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { Film, List, Plus, BarChart2, Loader, Tag, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/');
  }, [user, authLoading]);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-brand-red" /></div>;

  const cards = [
    { label: 'Tổng phim',   value: stats?.total   ?? '—', icon: Film,  color: 'from-red-600 to-red-800', href: '/admin/movies' },
    { label: 'Phim lẻ',     value: stats?.phimLe  ?? '—', icon: Film,  color: 'from-blue-600 to-blue-800', href: '/admin/movies?type=phim-le' },
    { label: 'Phim bộ',     value: stats?.phimBo  ?? '—', icon: List,  color: 'from-purple-600 to-purple-800', href: '/admin/movies?type=phim-bo' },
    { label: 'Hoạt hình',   value: stats?.hoatHinh ?? '—', icon: Film, color: 'from-green-600 to-green-800', href: '/admin/movies?type=hoat-hinh' },
    { label: 'TV Shows',    value: stats?.tvShows  ?? '—', icon: Film,  color: 'from-yellow-600 to-yellow-800', href: '/admin/movies?type=tv-shows' },
    { label: 'Thể loại',    value: stats?.totalCats ?? '—', icon: Tag, color: 'from-pink-600 to-pink-800', href: '/admin/movies' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wide">ADMIN PANEL</h1>
          <p className="text-gray-400 mt-1">Quản lý nội dung HopPhim</p>
        </div>
        <Link href="/admin/movies/new"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Thêm phim
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {cards.map((c, i) => (
          <Link key={i} href={c.href}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} p-5 hover:scale-105 transition-transform`}>
            <c.icon className="w-6 h-6 text-white/60 mb-2" />
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-white/70 mt-0.5">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/movies',     icon: List,  label: 'Danh sách phim',    desc: 'Xem, sửa, xóa phim' },
          { href: '/admin/movies/new', icon: Plus,  label: 'Thêm phim mới',     desc: 'Tạo phim + thêm link video' },
          { href: '/',                 icon: Globe, label: 'Xem trang web',      desc: 'Mở HopPhim' },
        ].map((a, i) => (
          <Link key={i} href={a.href}
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-red/20 flex items-center justify-center flex-shrink-0">
              <a.icon className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <p className="font-semibold text-white">{a.label}</p>
              <p className="text-sm text-gray-400 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
