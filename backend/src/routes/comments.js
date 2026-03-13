const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/commentController');

// Optional auth middleware (doesn't block if no token)
const optionalAuth = (req, res, next) => {
  const auth = require('../middleware/auth');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  const jwt  = require('jsonwebtoken');
  const User = require('../models/User');
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err && decoded) {
      try { req.user = await User.findById(decoded.id); } catch (_) {}
    }
    next();
  });
};

router.get('/:slug',           optionalAuth, ctrl.getComments);
router.post('/:slug',          protect,      ctrl.createComment);
router.put('/:id/like',        protect,      ctrl.toggleLike);
router.delete('/:id',          protect,      ctrl.deleteComment);
router.get('/:id/replies',     optionalAuth, ctrl.getReplies);

module.exports = router;