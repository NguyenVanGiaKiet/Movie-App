const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect); // All favorite routes require auth

router.get('/', getFavorites);
router.post('/', addFavorite);
router.get('/check/:slug', checkFavorite);
router.delete('/:slug', removeFavorite);

module.exports = router;
