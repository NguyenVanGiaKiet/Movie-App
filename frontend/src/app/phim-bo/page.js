'use client';

import MovieListPage from '@/components/MovieListPage';
import { movieAPI } from '@/lib/api';

export default function PhimBoPage() {
  return (
    <MovieListPage
      fetchFn={(page) => movieAPI.getByDanhSach('phim-bo', page)}
      title="Phim Bộ"
      description="Series nhiều tập — mỗi đêm một tập, không thể dừng"
    />
  );
}
