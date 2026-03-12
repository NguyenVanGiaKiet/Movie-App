const express = require('express');
const r = express.Router();
const c = require('../controllers/movieController');
const Category = require('../models/Category');
const Country  = require('../models/Country');

// ── Public endpoints (compatible với phim.nguonc.com) ──────────────
r.get('/phim-moi-cap-nhat',      c.getNewMovies);        // mới cập nhật
r.get('/search',                 c.searchMovies);         // tìm kiếm
r.get('/hot',                    c.getHotMovies);         // phim hot
r.get('/danh-sach/:slug',        c.getByDanhSach);        // phim-le | phim-bo | tv-shows | hoat-hinh
r.get('/the-loai/:slug',         c.getByTheLoai);         // hanh-dong | kinh-di | ...
r.get('/quoc-gia/:slug',         c.getByQuocGia);         // au-my | han-quoc | ...
r.get('/nam-phat-hanh/:year',    c.getByNam);             // 2024 | 2025 | ...

// List categories & countries (public)
r.get('/the-loai',  async (_, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json({ status: true, items: cats });
});
r.get('/quoc-gia',  async (_, res) => {
  const countries = await Country.find().sort({ name: 1 });
  res.json({ status: true, items: countries });
});

module.exports = r;
