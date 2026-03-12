'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { ArrowLeft, Film } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MovieForm from '@/components/admin/MovieForm';

export default function EditMoviePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/');
  }, [user, authLoading]);

  useEffect(() => {
    if (!id) return;
    adminAPI.getMovie(id)
      .then(r => setMovie(r.data))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    await adminAPI.updateMovie(id, formData);
    toast.success('Cập nhật thành công!');
    router.push('/admin/movies');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/movies" className="p-2 glass rounded-xl hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">SỬA PHIM</h1>
          <p className="text-gray-400 text-sm">{movie?.name}</p>
        </div>
        <Link href={`/admin/movies/${id}/episodes`}
          className="ml-auto btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Film className="w-4 h-4" /> Quản lý tập phim
        </Link>
      </div>
      {movie && <MovieForm initialData={movie} onSubmit={handleSubmit} submitLabel="Lưu thay đổi" />}
    </div>
  );
}
