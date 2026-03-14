// Seed dữ liệu mẫu: categories, countries, admin user
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Category = require('../models/Category');
const Country  = require('../models/Country');
const User     = require('../models/User');

const CATEGORIES = [
  { name: 'Hành Động',          slug: 'hanh-dong' },
  { name: 'Phiêu Lưu',          slug: 'phieu-luu' },
  { name: 'Hoạt Hình',          slug: 'hoat-hinh' },
  { name: 'Hài',                slug: 'phim-hai' },
  { name: 'Kinh Dị',            slug: 'kinh-di' },
  { name: 'Tình Cảm',           slug: 'tinh-cam' },
  { name: 'Tâm Lý',             slug: 'tam-ly' },
  { name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' },
  { name: 'Cổ Trang',           slug: 'co-trang' },
  { name: 'Chiến Tranh',        slug: 'chien-tranh' },
  { name: 'Tài Liệu',           slug: 'tai-lieu' },
  { name: 'Gia Đình',           slug: 'gia-dinh' },
];

const COUNTRIES = [
  { name: 'Âu Mỹ',     slug: 'au-my' },
  { name: 'Hàn Quốc',  slug: 'han-quoc' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Nhật Bản',  slug: 'nhat-ban' },
  { name: 'Việt Nam',  slug: 'viet-nam' },
  { name: 'Thái Lan',  slug: 'thai-lan' },
  { name: 'Pháp',      slug: 'phap' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp');
  console.log('✅ Connected');

  // Categories
  for (const c of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }
  console.log('✅ Categories seeded');

  // Countries
  for (const c of COUNTRIES) {
    await Country.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }
  console.log('✅ Countries seeded');

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cinestream.com';
  const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@123456';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ name: 'Admin', email: adminEmail, password: adminPass, role: 'admin' });
    await admin.save();
    console.log(`✅ Admin created: ${adminEmail} / ${adminPass}`);
  } else {
    console.log(`ℹ️  Admin đã tồn tại: ${adminEmail}`);
  }

  mongoose.disconnect();
  console.log('🎬 Seed hoàn tất!');
}

seed().catch(console.error);
