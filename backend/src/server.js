require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

const app = express();
connectDB();

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15*60*1000, max: 500 }));

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────────────
// Public film API (cấu trúc giống phim.nguonc.com)
app.use('/api/films', require('./routes/films'));    // /api/films/phim-moi-cap-nhat, /api/films/search ...
app.use('/api/film',  require('./routes/film'));     // /api/film/:slug

// Auth
app.use('/api/auth',      require('./routes/auth'));
// Favorites
app.use('/api/favorites', require('./routes/favorites'));
// Admin panel
app.use('/api/admin',     require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🎬 CineStream API running!', version: '2.0' });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Lỗi máy chủ' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📡 Env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api/health`);
});
