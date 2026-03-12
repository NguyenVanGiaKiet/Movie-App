const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieSlug: {
      type: String,
      required: true,
    },
    movieData: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Prevent duplicate favorites per user
favoriteSchema.index({ user: 1, movieSlug: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
