'use client';

import MovieListPage from '@/components/MovieListPage';
import { movieAPI } from '@/lib/api';

export default function PhimLePage() {
  return (
    <MovieListPage
      fetchFn={(page) => movieAPI.getByDanhSach('phim-le', page)}
      title="Phim Lẻ"
      description="Phim chiếu rạp, bom tấn — xem một lần xong ngay"
    />
  );
}
