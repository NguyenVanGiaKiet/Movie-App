'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { Loader, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MovieForm from '@/components/admin/MovieForm';

export default function NewMoviePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/');
  }, [user, authLoading]);

  const handleSubmit = async (formData) => {
    const res = await adminAPI.createMovie(formData);
    toast.success('Tạo phim thành công!');
    router.push(`/admin/movies/${res.data._id}/episodes`);
    return res.data;
  };

  return (
    <div className="min-h-screen bg-[#181820] pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/movies" className="p-2 glass rounded-xl hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">THÊM PHIM MỚI</h1>
          <p className="text-gray-400 text-sm">Sau khi tạo, thêm link video ở bước tiếp theo</p>
        </div>
      </div>
      <MovieForm onSubmit={handleSubmit} submitLabel="Tạo phim & thêm link video →" />
    </div>
  );
}
