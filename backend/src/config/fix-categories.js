// Fix categories for existing movies
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const Country = require('../models/Country');

async function fixCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp');
    console.log('✅ Connected to MongoDB');

    // Get categories
    const hoatHinhCat = await Category.findOne({ slug: 'hoat-hinh' });
    const hanhDongCat = await Category.findOne({ slug: 'hanh-dong' });
    const tinhCamCat = await Category.findOne({ slug: 'tinh-cam' });
    const kinhDiCat = await Category.findOne({ slug: 'kinh-di' });
    const khoaHocVienTuongCat = await Category.findOne({ slug: 'khoa-hoc-vien-tuong' });
    
    // Get countries
    const usCountry = await Country.findOne({ slug: 'au-my' });
    const krCountry = await Country.findOne({ slug: 'han-quoc' });
    const jpCountry = await Country.findOne({ slug: 'nhat-ban' });

    // Update specific movies
    const updates = [
      {
        name: 'Spirited Away',
        update: { 
          category: [hoatHinhCat._id], 
          country: [jpCountry._id],
          content: 'Chihiro, một cô bé 10 tuổi, cùng gia đình chuyển đến nhà mới. Bị lạc vào thế giới linh hồn, cô phải làm việc trong nhà tắm của các vị thần để cứu cha mẹ và trở về thế giới con người.'
        }
      },
      {
        name: 'One Piece',
        update: { 
          category: [hoatHinhCat._id], 
          country: [jpCountry._id],
          content: 'Monkey D. Luffy và băng hải tặc Mũ Rơm đi tìm kho báu huyền thoại One Piece và trở thành Vua Hải Tặc.'
        }
      },
      {
        name: 'Naruto Shippuden',
        update: { 
          category: [hoatHinhCat._id], 
          country: [jpCountry._id],
          content: 'Naruto Uzumaki trở về làng sau 2 năm huấn luyện và tiếp tục hành trình bảo vệ làng và trở thành Hokage.'
        }
      },
      {
        name: 'Avengers: Endgame',
        update: { 
          category: [hanhDongCat._id], 
          country: [usCountry._id],
          content: 'Các Avengers tập hợp lại để đảo ngược hành động của Thanos và cứu vũ trụ.'
        }
      },
      {
        name: 'Interstellar',
        update: { 
          category: [khoaHocVienTuongCat._id], 
          country: [usCountry._id],
          content: 'Nhà thám hiểm Cooper đi vào một lỗ hổng không gian để tìm nơi ở mới cho nhân loại.'
        }
      },
      {
        name: 'Squid Game',
        update: { 
          category: [tinhCamCat._id, kinhDiCat._id], 
          country: [krCountry._id],
          content: '456 người mắc nợ tham gia một loạt trò chơi chết chóc để giành giải thưởng 45.6 tỷ won.'
        }
      }
    ];

    for (const { name, update } of updates) {
      const result = await Movie.findOneAndUpdate(
        { name }, 
        update, 
        { new: true }
      );
      if (result) {
        console.log(`✅ Updated: ${name}`);
      } else {
        console.log(`❌ Not found: ${name}`);
      }
    }

    console.log('\n🎬 Checking Hoat Hinh movies after fix:');
    const hoatHinhMovies = await Movie.find({ category: hoatHinhCat._id, is_shown: true });
    console.log(`✨ Hoạt Hình movies: ${hoatHinhMovies.length} items`);
    hoatHinhMovies.forEach(m => console.log(`  - ${m.name}`));

    mongoose.disconnect();
    console.log('🎉 Categories fixed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCategories();
