const Movie    = require('../models/Movie');
const Category = require('../models/Category');
const Country  = require('../models/Country');
const { paginate } = require('../utils/paginate');

const POP = [
  { path: 'category', select: 'name slug' },
  { path: 'country',  select: 'name slug' },
];
const SELECT_LIST = 'name origin_name slug thumb_url poster_url year quality lang episode_current type status view';

// ── Helpers ──────────────────────────────────────────────────────
async function getPage(query, page, limit) {
  const skip  = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Movie.find(query).select(SELECT_LIST).populate(POP).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Movie.countDocuments(query),
  ]);
  return { items, total };
}

// ── Public Controllers ────────────────────────────────────────────

// GET /api/films/phim-moi-cap-nhat?page=1
exports.getNewMovies = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const { items, total } = await getPage({ is_shown: true }, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/films/danh-sach/:slug?page=1
exports.getByDanhSach = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const { items, total } = await getPage({ type: slug, is_shown: true }, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/films/the-loai/:slug?page=1
exports.getByTheLoai = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const cat = await Category.findOne({ slug });
    if (!cat) return res.json({ status: true, data: paginate({ items: [], page, limit, total: 0 }) });
    const { items, total } = await getPage({ category: cat._id, is_shown: true }, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/films/quoc-gia/:slug?page=1
exports.getByQuocGia = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const country = await Country.findOne({ slug });
    if (!country) return res.json({ status: true, data: paginate({ items: [], page, limit, total: 0 }) });
    const { items, total } = await getPage({ country: country._id, is_shown: true }, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/films/nam-phat-hanh/:year?page=1
exports.getByYear = async (req, res) => {
  try {
    const year  = parseInt(req.params.year);
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const { items, total } = await getPage({ year, is_shown: true }, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/films/search?keyword=xxx&page=1
exports.searchMovies = async (req, res) => {
  try {
    const { keyword, page: p = 1, limit: l = 24 } = req.query;
    if (!keyword) return res.status(400).json({ status: false, message: 'Thiếu keyword' });
    const page  = parseInt(p);
    const limit = parseInt(l);
    const regex = new RegExp(keyword, 'i');
    const query = {
      is_shown: true,
      $or: [{ name: regex }, { origin_name: regex }, { actor: regex }, { director: regex }],
    };
    const { items, total } = await getPage(query, page, limit);
    res.json({ status: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};

// GET /api/film/:slug
exports.getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug, is_shown: true })
      .populate(POP);
    if (!movie) return res.status(404).json({ status: false, message: 'Không tìm thấy phim' });
    // Tăng view
    await Movie.findByIdAndUpdate(movie._id, { $inc: { view: 1 } });
    res.json({ status: true, data: { movie, episodes: movie.episodes } });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
};
