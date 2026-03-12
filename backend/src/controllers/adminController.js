const Movie    = require('../models/Movie');
const Category = require('../models/Category');
const Country  = require('../models/Country');
const { slugify } = require('../utils/slug');
const { paginate } = require('../utils/paginate');

// ── Helpers ──────────────────────────────────────────────────────
async function resolveRefs(categoryNames = [], countryNames = []) {
  // Tự động tạo category/country nếu chưa có
  const getCats = categoryNames.filter(Boolean).map(async (name) => {
    const slug = slugify(name);
    let doc = await Category.findOne({ slug });
    if (!doc) doc = await Category.create({ name, slug });
    return doc._id;
  });
  const getCounts = countryNames.filter(Boolean).map(async (name) => {
    const slug = slugify(name);
    let doc = await Country.findOne({ slug });
    if (!doc) doc = await Country.create({ name, slug });
    return doc._id;
  });
  const [category, country] = await Promise.all([
    Promise.all(getCats),
    Promise.all(getCounts),
  ]);
  return { category, country };
}

// ════════════════════════════════════════════════════════════════
//  MOVIES CRUD
// ════════════════════════════════════════════════════════════════

// GET /api/admin/movies?page=1&search=xxx
exports.listMovies = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)   || 1;
    const limit = parseInt(req.query.limit)  || 20;
    const skip  = (page - 1) * limit;
    const search = req.query.search;
    const query  = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { origin_name: new RegExp(search, 'i') }] }
      : {};
    const [items, total] = await Promise.all([
      Movie.find(query)
        .select('name origin_name slug year type quality is_shown view createdAt')
        .populate('category', 'name')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Movie.countDocuments(query),
    ]);
    res.json({ success: true, data: paginate({ items, page, limit, total }) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/admin/movies/:id
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('country', 'name slug');
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, data: movie });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/admin/movies
exports.createMovie = async (req, res) => {
  try {
    const {
      name, origin_name, content, type, status,
      thumb_url, poster_url, trailer_url, video_url,
      time, episode_current, episode_total,
      quality, lang, year,
      categoryNames = [], countryNames = [],
      director = [], actor = [],
      is_shown = true,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Tên phim là bắt buộc' });

    // Auto-generate slug
    let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    // Ensure unique slug
    const existing = await Movie.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const { category, country } = await resolveRefs(categoryNames, countryNames);

    const movie = await Movie.create({
      name, origin_name, slug, content, type, status,
      thumb_url, poster_url, trailer_url, video_url,
      time, episode_current, episode_total,
      quality, lang, year: parseInt(year) || new Date().getFullYear(),
      category, country,
      director: Array.isArray(director) ? director : [director].filter(Boolean),
      actor:    Array.isArray(actor)    ? actor    : [actor].filter(Boolean),
      episodes: [],
      is_shown,
    });

    res.status(201).json({ success: true, message: 'Tạo phim thành công', data: movie });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/admin/movies/:id
exports.updateMovie = async (req, res) => {
  try {
    const {
      name, origin_name, slug: newSlug, content, type, status,
      thumb_url, poster_url, trailer_url, video_url,
      time, episode_current, episode_total,
      quality, lang, year,
      categoryNames, countryNames,
      director, actor, is_shown,
    } = req.body;

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });

    if (name)        movie.name        = name;
    if (origin_name !== undefined) movie.origin_name = origin_name;
    if (newSlug)     movie.slug        = slugify(newSlug);
    if (content !== undefined)     movie.content     = content;
    if (type)        movie.type        = type;
    if (status)      movie.status      = status;
    if (thumb_url !== undefined)   movie.thumb_url   = thumb_url;
    if (poster_url !== undefined)  movie.poster_url  = poster_url;
    if (trailer_url !== undefined) movie.trailer_url = trailer_url;
    if (video_url !== undefined)   movie.video_url   = video_url;
    if (time !== undefined)        movie.time        = time;
    if (episode_current !== undefined) movie.episode_current = episode_current;
    if (episode_total !== undefined)   movie.episode_total   = episode_total;
    if (quality)     movie.quality     = quality;
    if (lang)        movie.lang        = lang;
    if (year)        movie.year        = parseInt(year);
    if (is_shown !== undefined)    movie.is_shown    = is_shown;
    if (director)    movie.director    = Array.isArray(director) ? director : [director];
    if (actor)       movie.actor       = Array.isArray(actor)    ? actor    : [actor];

    if (categoryNames) {
      const { category, country: c } = await resolveRefs(categoryNames, countryNames || []);
      movie.category = category;
      if (countryNames) movie.country = c;
    }

    await movie.save();
    res.json({ success: true, message: 'Cập nhật thành công', data: movie });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/admin/movies/:id
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, message: 'Đã xóa phim' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  EPISODES / SERVERS CRUD
// ════════════════════════════════════════════════════════════════

// GET /api/admin/movies/:id/episodes
exports.getEpisodes = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select('episodes name slug');
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, data: movie.episodes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/admin/movies/:id/servers — thêm server mới
exports.addServer = async (req, res) => {
  try {
    const { server_name } = req.body;
    if (!server_name) return res.status(400).json({ success: false, message: 'server_name là bắt buộc' });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    movie.episodes.push({ server_name, server_data: [] });
    await movie.save();
    res.status(201).json({ success: true, message: 'Đã thêm server', data: movie.episodes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/admin/movies/:id/servers/:serverId — đổi tên server
exports.updateServer = async (req, res) => {
  try {
    const movie  = await Movie.findById(req.params.id);
    const server = movie?.episodes?.id(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    if (req.body.server_name) server.server_name = req.body.server_name;
    await movie.save();
    res.json({ success: true, data: movie.episodes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/admin/movies/:id/servers/:serverId
exports.deleteServer = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    movie.episodes = movie.episodes.filter(s => s._id.toString() !== req.params.serverId);
    await movie.save();
    res.json({ success: true, message: 'Đã xóa server', data: movie.episodes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/admin/movies/:id/servers/:serverId/episodes — thêm tập phim + link
exports.addEpisode = async (req, res) => {
  try {
    const { name, slug: epSlug, filename, link_embed, link_m3u8 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên tập là bắt buộc' });
    const movie  = await Movie.findById(req.params.id);
    const server = movie?.episodes?.id(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Không tìm thấy server' });

    const { slugify } = require('../utils/slug');
    server.server_data.push({
      name,
      slug:       epSlug || slugify(name),
      filename:   filename   || '',
      link_embed: link_embed || '',
      link_m3u8:  link_m3u8  || '',
    });
    await movie.save();
    res.status(201).json({ success: true, message: 'Đã thêm tập phim', data: server.server_data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/admin/movies/:id/servers/:serverId/episodes/:epId — sửa tập phim
exports.updateEpisode = async (req, res) => {
  try {
    const movie    = await Movie.findById(req.params.id);
    const server   = movie?.episodes?.id(req.params.serverId);
    const episode  = server?.server_data?.id(req.params.epId);
    if (!episode) return res.status(404).json({ success: false, message: 'Không tìm thấy tập phim' });

    const { name, slug: epSlug, filename, link_embed, link_m3u8 } = req.body;
    if (name       !== undefined) episode.name       = name;
    if (epSlug     !== undefined) episode.slug       = epSlug;
    if (filename   !== undefined) episode.filename   = filename;
    if (link_embed !== undefined) episode.link_embed = link_embed;
    if (link_m3u8  !== undefined) episode.link_m3u8  = link_m3u8;

    await movie.save();
    res.json({ success: true, message: 'Đã cập nhật tập phim', data: server.server_data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/admin/movies/:id/servers/:serverId/episodes/:epId
exports.deleteEpisode = async (req, res) => {
  try {
    const movie  = await Movie.findById(req.params.id);
    const server = movie?.episodes?.id(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    server.server_data = server.server_data.filter(e => e._id.toString() !== req.params.epId);
    await movie.save();
    res.json({ success: true, message: 'Đã xóa tập phim', data: server.server_data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  CATEGORIES & COUNTRIES
// ════════════════════════════════════════════════════════════════

exports.listCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: cats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const cat = await Category.create({ name, slug });
    res.status(201).json({ success: true, data: cat });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa thể loại' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.listCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json({ success: true, data: countries });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const country = await Country.create({ name, slug });
    res.status(201).json({ success: true, data: country });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteCountry = async (req, res) => {
  try {
    await Country.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa quốc gia' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [total, phimLe, phimBo, tvShows, hoatHinh, totalCats] = await Promise.all([
      Movie.countDocuments(),
      Movie.countDocuments({ type: 'phim-le' }),
      Movie.countDocuments({ type: 'phim-bo' }),
      Movie.countDocuments({ type: 'tv-shows' }),
      Movie.countDocuments({ type: 'hoat-hinh' }),
      Category.countDocuments(),
    ]);
    res.json({ success: true, data: { total, phimLe, phimBo, tvShows, hoatHinh, totalCats } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};