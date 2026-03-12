const Favorite = require('../models/Favorite');

// @desc    Get user favorites
// @route   GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { favorites, count: favorites.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải danh sách yêu thích' });
  }
};

// @desc    Add movie to favorites
// @route   POST /api/favorites
const addFavorite = async (req, res) => {
  try {
    const { movieSlug, movieData } = req.body;

    if (!movieSlug) {
      return res.status(400).json({ success: false, message: 'movieSlug là bắt buộc' });
    }

    const existing = await Favorite.findOne({ user: req.user._id, movieSlug });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Phim đã có trong danh sách yêu thích' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      movieSlug,
      movieData,
    });

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: { favorite },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ' });
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:slug
const removeFavorite = async (req, res) => {
  try {
    const { slug } = req.params;
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      movieSlug: slug,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim trong danh sách yêu thích' });
    }

    res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// @desc    Check if movie is in favorites
// @route   GET /api/favorites/check/:slug
const checkFavorite = async (req, res) => {
  try {
    const { slug } = req.params;
    const favorite = await Favorite.findOne({ user: req.user._id, movieSlug: slug });
    res.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
