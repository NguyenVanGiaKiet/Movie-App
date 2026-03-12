// Test database connection and check data
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Country = require('../models/Country');
const Movie = require('../models/Movie');

async function testDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp');
    console.log('✅ Connected to MongoDB');

    // Check categories
    const categories = await Category.find();
    console.log(`📁 Categories: ${categories.length} items`);
    categories.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

    // Check countries
    const countries = await Country.find();
    console.log(`🌍 Countries: ${countries.length} items`);
    countries.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

    // Check movies
    const movies = await Movie.find().populate('category country');
    console.log(`🎬 Movies: ${movies.length} items`);
    
    // Check hoat-hinh movies specifically
    const hoatHinhCat = await Category.findOne({ slug: 'hoat-hinh' });
    if (hoatHinhCat) {
      const hoatHinhMovies = await Movie.find({ category: hoatHinhCat._id, is_shown: true });
      console.log(`✨ Hoạt Hình movies: ${hoatHinhMovies.length} items`);
      hoatHinhMovies.forEach(m => console.log(`  - ${m.name}`));
    } else {
      console.log('❌ No "hoat-hinh" category found');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDB();
