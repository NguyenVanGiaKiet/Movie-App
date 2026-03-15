'use client'
import MovieListPage from '@/components/MovieListPage';
import { movieAPI } from '@/lib/api';

export default function TvShowsPage() {
  return (
    <MovieListPage
      fetchFn={(page) => movieAPI.getByDanhSach('tv-shows', page)}
      title="TV Shows"
      description="Chương trình truyền hình đình đám từ khắp nơi trên thế giới"
    />
  );
}
