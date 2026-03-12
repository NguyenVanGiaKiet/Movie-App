// Single movie detail
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/movieController');

router.get('/:slug', ctrl.getMovieBySlug);

module.exports = router;
