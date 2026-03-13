const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    movieSlug: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bình luận không được để trống'],
      trim: true,
      maxlength: [1000, 'Bình luận không được quá 1000 ký tự'],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // reply to parent comment
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

commentSchema.set('toObject', { virtuals: true });
commentSchema.set('toJSON',   { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema);