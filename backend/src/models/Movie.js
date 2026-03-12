const mongoose = require('mongoose');

// ── Episode link (1 link trong 1 server) ─────────────────────────
const episodeLinkSchema = new mongoose.Schema({
  name:         { type: String, required: true },   // "Tập 1", "Full", "Part 1"
  slug:         { type: String, required: true },   // "tap-1", "full"
  filename:     { type: String, default: '' },
  link_embed:   { type: String, default: '' },      // iframe embed URL
  link_m3u8:    { type: String, default: '' },      // direct m3u8 stream URL
}, { _id: true });

// ── Server (1 nhóm tập phim trên 1 server) ───────────────────────
const serverSchema = new mongoose.Schema({
  server_name:  { type: String, required: true },   // "Server Vietsub", "Server Thuyết minh"
  server_data:  [episodeLinkSchema],
}, { _id: true });

// ── Main Movie schema ─────────────────────────────────────────────
const movieSchema = new mongoose.Schema({
  // Nhận dạng
  name:         { type: String, required: true, trim: true },
  origin_name:  { type: String, default: '', trim: true },
  slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },

  // Nội dung
  content:      { type: String, default: '' },
  type: {
    type: String,
    enum: ['phim-le', 'phim-bo', 'tv-shows', 'hoat-hinh'],
    default: 'phim-le',
  },
  status: {
    type: String,
    enum: ['completed', 'ongoing', 'trailer'],
    default: 'completed',
  },

  // Hình ảnh
  thumb_url:    { type: String, default: '' },
  poster_url:   { type: String, default: '' },
  trailer_url:  { type: String, default: '' },

  // Link phim trực tiếp (dùng cho phim lẻ, không cần tạo server/tập)
  // VD: https://embed14.streamc.xyz/embed.php?hash=abc123
  video_url:    { type: String, default: '' },

  // Thông tin phim
  time:             { type: String, default: '' },         // "120 phút", "45 phút/tập"
  episode_current:  { type: String, default: 'Full' },     // "Full", "Tập 12", "Hoàn tất (24/24)"
  episode_total:    { type: String, default: '' },
  quality:          { type: String, default: 'HD' },       // "HD", "FHD", "CAM"
  lang:             { type: String, default: 'Vietsub' },  // "Vietsub", "Thuyết minh", "Lồng tiếng"
  year:             { type: Number, default: () => new Date().getFullYear() },

  // Liên kết
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  country:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
  director: [{ type: String, trim: true }],
  actor:    [{ type: String, trim: true }],

  // Tập phim & link video
  episodes: [serverSchema],

  // Stats
  view:    { type: Number, default: 0 },
  is_shown: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index để tìm kiếm nhanh
movieSchema.index({ name: 'text', origin_name: 'text', actor: 'text', director: 'text' });
movieSchema.index({ slug: 1 });
movieSchema.index({ type: 1, createdAt: -1 });
movieSchema.index({ year: -1 });
movieSchema.index({ is_shown: 1 });

module.exports = mongoose.model('Movie', movieSchema);