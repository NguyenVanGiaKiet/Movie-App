// Public film routes — mirror phim.nguonc.com API structure
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/movieController');

router.get('/phim-moi-cap-nhat',    ctrl.getNewMovies);
router.get('/danh-sach/:slug',      ctrl.getByDanhSach);
router.get('/the-loai/:slug',       ctrl.getByTheLoai);
router.get('/quoc-gia/:slug',       ctrl.getByQuocGia);
router.get('/nam-phat-hanh/:year',  ctrl.getByYear);
router.get('/search',               ctrl.searchMovies);

module.exports = router;
