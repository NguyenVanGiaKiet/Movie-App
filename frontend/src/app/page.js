'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import SeriesBanner from '@/components/SeriesBanner';
import TopRankRow from '@/components/TopRankRow';
import NewMovieRow from '@/components/NewMovieRow';
import { movieAPI } from '@/lib/api';

function extractItems(res) {
  if (res?.status !== 'fulfilled') return [];
  const d = res.value?.data;
  return d?.items || d?.movies || d?.data || [];
}

export default function HomePage() {

  const [newMovies, setNewMovies] = useState([]);
  const [phimLe, setPhimLe] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [hoatHinh, setHoatHinh] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchAll = async () => {

      const [newRes, leRes, boRes, animRes] = await Promise.allSettled([
        movieAPI.getMovies(1), // Default 24 items
        movieAPI.getByDanhSach('phim-le', 1),
        movieAPI.getByDanhSach('phim-bo', 1),
        movieAPI.getByTheLoai('hoat-hinh', 1),
      ]);

      setNewMovies(extractItems(newRes));
      setPhimLe(extractItems(leRes));
      setPhimBo(extractItems(boRes));
      setHoatHinh(extractItems(animRes));

      // delay loading 1.5s
      setTimeout(() => {
        setLoading(false);
      }, 1500);

    };

    fetchAll();

  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div id="ghost">
          <div id="red">
            <div id="pupil"></div>
            <div id="pupil1"></div>
            <div id="eye"></div>
            <div id="eye1"></div>

            <div id="top0"></div>
            <div id="top1"></div>
            <div id="top2"></div>
            <div id="top3"></div>
            <div id="top4"></div>

            <div id="st0"></div>
            <div id="st1"></div>
            <div id="st2"></div>
            <div id="st3"></div>
            <div id="st4"></div>
            <div id="st5"></div>

            <div id="an1"></div>
            <div id="an2"></div>
            <div id="an3"></div>
            <div id="an4"></div>
            <div id="an5"></div>
            <div id="an6"></div>
            <div id="an7"></div>
            <div id="an8"></div>
            <div id="an9"></div>
            <div id="an10"></div>
            <div id="an11"></div>
            <div id="an12"></div>
            <div id="an13"></div>
            <div id="an14"></div>
            <div id="an15"></div>
            <div id="an16"></div>
            <div id="an17"></div>
            <div id="an18"></div>
          </div>

          <div id="shadow"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">

      <Hero movies={newMovies.slice(0, 20)} />

      <div className="pt-8">
        <TopRankRow title="Phim Mới" movies={newMovies} loading={loading} />
        <NewMovieRow title="Phim Lẻ" movies={phimLe} loading={loading} />
        <SeriesBanner movies={phimBo} loading={loading} />
        <MovieRow title="Hoạt Hình" movies={hoatHinh} loading={loading} />
      </div>

    </div>
  );
}