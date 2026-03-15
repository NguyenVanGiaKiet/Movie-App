'use client';

import MovieListPage from '@/components/MovieListPage';
import { movieAPI } from '@/lib/api';

export default function HoatHinhPage() {
  return (
    <MovieListPage
      fetchFn={(page) => movieAPI.getByTheLoai('hoat-hinh', page)}
      title="Hoạt Hình"
      description="Anime, cartoon, animation — thế giới không giới hạn"
    />
  );
}
