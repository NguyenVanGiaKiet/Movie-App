// Check existing movies and their categories
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const Country = require('../models/Country');

async function checkMovies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp');
    console.log('✅ Connected to MongoDB');

    const movies = await Movie.find().populate('category country');
    console.log(`🎬 Movies: ${movies.length} items\n`);
    
    movies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name}`);
      console.log(`   Type: ${movie.type}`);
      console.log(`   Categories: ${movie.category.map(c => c.name).join(', ') || 'None'}`);
      console.log(`   Country: ${movie.country.map(c => c.name).join(', ') || 'None'}`);
      console.log(`   Year: ${movie.year}`);
      console.log('');
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMovies();
