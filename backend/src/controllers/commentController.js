const Comment = require('../models/Comment');
const Movie   = require('../models/Movie');

// GET /api/comments/:slug?page=1&limit=20
exports.getComments = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip  = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ movieSlug: slug, parent: null, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar')
        .populate({
          path: 'replies',
          match: { isDeleted: false },
          options: { sort: { createdAt: 1 }, limit: 5 },
          populate: { path: 'user', select: 'name avatar' },
        })
        .lean(),
      Comment.countDocuments({ movieSlug: slug, parent: null, isDeleted: false }),
    ]);

    // Attach likeCount + likedByMe
    const userId = req.user?._id?.toString();
    const mapped = comments.map(c => ({
      ...c,
      likeCount: c.likes?.length || 0,
      likedByMe: userId ? c.likes?.some(id => id.toString() === userId) : false,
      replies: (c.replies || []).map(r => ({
        ...r,
        likeCount: r.likes?.length || 0,
        likedByMe: userId ? r.likes?.some(id => id.toString() === userId) : false,
      })),
    }));

    res.json({
      success: true,
      data: mapped,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/comments/:slug
exports.createComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content, parentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    }

    const movie = await Movie.findOne({ slug });
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });

    const comment = await Comment.create({
      movie: movie._id,
      movieSlug: slug,
      user: req.user._id,
      content: content.trim(),
      parent: parentId || null,
    });

    await comment.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: {
        ...comment.toObject(),
        likeCount: 0,
        likedByMe: false,
        replies: [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/comments/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    }

    const uid = req.user._id;
    const idx = comment.likes.findIndex(id => id.equals(uid));
    if (idx === -1) comment.likes.push(uid);
    else            comment.likes.splice(idx, 1);
    await comment.save();

    res.json({
      success: true,
      likeCount: comment.likes.length,
      likedByMe: idx === -1,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/comments/:id  (own comment or admin)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });

    const isOwner = comment.user.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa bình luận này' });
    }

    comment.isDeleted = true;
    comment.content   = '[Bình luận đã bị xóa]';
    await comment.save();

    res.json({ success: true, message: 'Đã xóa bình luận' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET replies for a comment
exports.getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({ parent: req.params.id, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate('user', 'name avatar')
      .lean();

    const userId = req.user?._id?.toString();
    res.json({
      success: true,
      data: replies.map(r => ({
        ...r,
        likeCount: r.likes?.length || 0,
        likedByMe: userId ? r.likes?.some(id => id.toString() === userId) : false,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};