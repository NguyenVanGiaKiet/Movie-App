import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  getMe:         ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Public Film API (cấu trúc /api/films/* và /api/film/:slug) ────
export const movieAPI = {
  // Danh sách
  getMovies:       (page = 1)         => api.get('/films/phim-moi-cap-nhat', { params: { page } }),
  getByDanhSach:   (slug, page = 1)   => api.get(`/films/danh-sach/${slug}`, { params: { page } }),
  getByTheLoai:    (slug, page = 1)   => api.get(`/films/the-loai/${slug}`,  { params: { page } }),
  getByQuocGia:    (slug, page = 1)   => api.get(`/films/quoc-gia/${slug}`,  { params: { page } }),
  getByNam:        (year, page = 1)   => api.get(`/films/nam-phat-hanh/${year}`, { params: { page } }),
  searchMovies:    (keyword, page=1)  => api.get('/films/search', { params: { keyword, page } }),

  // Chi tiết
  getMovieBySlug:  (slug) => api.get(`/film/${slug}`),
};

// ── Favorites ─────────────────────────────────────────────────────
export const favoriteAPI = {
  getFavorites:   ()     => api.get('/favorites'),
  addFavorite:    (data) => api.post('/favorites', data),
  removeFavorite: (slug) => api.delete(`/favorites/${slug}`),
  checkFavorite:  (slug) => api.get(`/favorites/check/${slug}`),
};

// ── Admin API ─────────────────────────────────────────────────────
export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Movies
  listMovies:   (params) => api.get('/admin/movies', { params }),
  getMovie:     (id)     => api.get(`/admin/movies/${id}`),
  createMovie:  (data)   => api.post('/admin/movies', data),
  updateMovie:  (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie:  (id)     => api.delete(`/admin/movies/${id}`),

  // Servers
  addServer:    (movieId, data)          => api.post(`/admin/movies/${movieId}/servers`, data),
  updateServer: (movieId, sid, data)     => api.put(`/admin/movies/${movieId}/servers/${sid}`, data),
  deleteServer: (movieId, sid)           => api.delete(`/admin/movies/${movieId}/servers/${sid}`),

  // Episodes
  getEpisodes:    (movieId)                   => api.get(`/admin/movies/${movieId}/episodes`),
  addEpisode:     (movieId, sid, data)        => api.post(`/admin/movies/${movieId}/servers/${sid}/episodes`, data),
  updateEpisode:  (movieId, sid, eid, data)   => api.put(`/admin/movies/${movieId}/servers/${sid}/episodes/${eid}`, data),
  deleteEpisode:  (movieId, sid, eid)         => api.delete(`/admin/movies/${movieId}/servers/${sid}/episodes/${eid}`),

  // Categories & Countries
  listCategories:  () => api.get('/admin/categories'),
  createCategory:  (data) => api.post('/admin/categories', data),
  deleteCategory:  (id)   => api.delete(`/admin/categories/${id}`),
  listCountries:   () => api.get('/admin/countries'),
  createCountry:   (data) => api.post('/admin/countries', data),
  deleteCountry:   (id)   => api.delete(`/admin/countries/${id}`),
};
