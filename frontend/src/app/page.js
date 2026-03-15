'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import SeriesBanner from '@/components/SeriesBanner';
import TopRankRow from '@/components/TopRankRow';
import NewMovieRow from '@/components/NewMovieRow';
import { movieAPI } from '@/lib/api';

// Extract items from various API response shapes
function extractItems(res) {
  if (res?.status !== 'fulfilled') return [];
  const d = res.value?.data;
  return d?.items || d?.movies || d?.data || [];
}

export default function HomePage() {
  const [newMovies,   setNewMovies]   = useState([]);
  const [phimLe,      setPhimLe]      = useState([]);
  const [phimBo,      setPhimBo]      = useState([]);
  const [hoatHinh,    setHoatHinh]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [newRes, leRes, boRes, animRes] = await Promise.allSettled([
          movieAPI.getMovies(1),                   // phim-moi-cap-nhat
          movieAPI.getByDanhSach('phim-le', 1),    // /danh-sach/phim-le
          movieAPI.getByDanhSach('phim-bo', 1),    // /danh-sach/phim-bo
          movieAPI.getByTheLoai('hoat-hinh', 1),   // /the-loai/hoat-hinh
        ]);

        setNewMovies(extractItems(newRes));
        setPhimLe(extractItems(leRes));
        setPhimBo(extractItems(boRes));
        setHoatHinh(extractItems(animRes));
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="page-enter">
      <Hero movies={newMovies.slice(0, 5)} />
      <div className="pt-8">
        <TopRankRow title="Phim Mới" movies={newMovies} loading={loading} />
        <NewMovieRow title="Phim Lẻ" movies={phimLe} loading={loading} />
        <SeriesBanner movies={phimBo} loading={loading} />
        <MovieRow title="Hoạt Hình"         movies={hoatHinh}  loading={loading} />
      </div>
    </div>
  );
}
