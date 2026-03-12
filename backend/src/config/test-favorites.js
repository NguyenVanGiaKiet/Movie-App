// Test favorites functionality
require('dotenv').config();
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const User = require('../models/User');

async function testFavorites() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp');
    console.log('✅ Connected to MongoDB');

    // Check if User model exists and has data
    const users = await User.find();
    console.log(`👥 Users: ${users.length} items`);
    if (users.length > 0) {
      console.log('First user:', users[0].email || users[0].name);
    }

    // Check if Favorite model exists
    const favorites = await Favorite.find();
    console.log(`❤️ Favorites: ${favorites.length} items`);

    // Check Favorite schema indexes
    const indexes = await Favorite.collection.getIndexes();
    console.log('📋 Favorite indexes:', Object.keys(indexes));

    // Try to create a test favorite
    if (users.length > 0) {
      try {
        const testFavorite = await Favorite.create({
          user: users[0]._id,
          movieSlug: 'test-movie-slug',
          movieData: {
            name: 'Test Movie',
            year: 2023,
            type: 'phim-le'
          }
        });
        console.log('✅ Test favorite created:', testFavorite._id);
        
        // Clean up test favorite
        await Favorite.findByIdAndDelete(testFavorite._id);
        console.log('🧹 Test favorite cleaned up');
      } catch (error) {
        console.error('❌ Error creating test favorite:', error.message);
        console.error('Full error:', error);
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testFavorites();
