# 🎬 Movie App – Web App Xem Phim Trực Tuyến

Ứng dụng xem phim hiện đại với giao diện Netflix-style, tích hợp nhiều tính năng nâng cao và trải nghiệm người dùng tối ưu.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square&logo=mongodb)

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Mô tả |
|-----------|-------|
| 🏠 **Hero Banner** | 20 phim featured với trailer tự động phát, trailer dừng khi scroll |
| 🎬 **Trailer Control** | Tắt tiếng mặc định, tự động phát/dừng khi scroll, continue khi chuyển tab |
| �️ **Movie Rows** | 5 loại rows với cắt góc zigzag, smooth scrolling, click disabled khi scroll |
| 📱 **Responsive Design** | Mobile-optimized với dots thu gọn, touch-friendly |
| 🔍 **Tìm kiếm** | Tìm kiếm phim theo tên với real-time suggestions |
| 📊 **Top Rankings** | Hiển thị top phim với xếp hạng và màu sắc gradient |
| � **Comments** | Hệ thống bình luận cho từng phim |
| ❤️ **Yêu thích** | Thêm/xóa phim yêu thích với authentication |
| 🎭 **Series Banner** | Banner đặc biệt cho phim bộ |
| 🌙 **Dark Mode** | Giao diện tối mặc định với CSS variables |
| ⚡ **Performance** | Lazy loading, skeleton states, optimized transitions |

---

## 🏗️ Kiến Trúc Hệ Thống

```
movie-app/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Kết nối MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.js    # Xử lý đăng ký/đăng nhập
│   │   │   ├── movieController.js   # Proxy API phim
│   │   │   ├── commentController.js # Quản lý bình luận
│   │   │   └── favoriteController.js # Quản lý yêu thích
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js         # Schema người dùng
│   │   │   ├── Comment.js      # Schema bình luận
│   │   │   └── Favorite.js     # Schema yêu thích
│   │   ├── routes/
│   │   │   ├── auth.js         # /api/auth/*
│   │   │   ├── movies.js       # /api/movies/*
│   │   │   ├── films.js        # /api/films/*
│   │   │   ├── comments.js     # /api/comments/*
│   │   │   ├── favorites.js    # /api/favorites/*
│   │   │   └── admin.js        # /api/admin/*
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.js           # Root layout
    │   │   ├── page.js             # Trang chủ (20 phim featured)
    │   │   ├── search/page.js      # Tìm kiếm
    │   │   ├── movie/[slug]/page.js # Chi tiết phim
    │   │   ├── login/page.js       # Đăng nhập
    │   │   ├── register/page.js    # Đăng ký
    │   │   └── favorites/page.js   # Yêu thích
    │   ├── components/
    │   │   ├── Navbar.js           # Thanh điều hướng
    │   │   ├── Hero.js             # Hero banner với trailer
    │   │   ├── MovieCard.js        # Card phim với transitions
    │   │   ├── MovieRow.js         # Row phim với cắt góc
    │   │   ├── NewMovieRow.js      # Row phim mới (ngược với MR)
    │   │   ├── TopRankRow.js       # Top phim với ranking
    │   │   ├── SeriesBanner.js     # Banner phim bộ
    │   │   ├── TrailerPlayer.js    # YouTube trailer player
    │   │   ├── Comments.js         # Component bình luận
    │   │   └── GhostLoading.js     # Loading states
    │   ├── lib/
    │   │   └── api.js              # Axios instances & API calls
    │   └── styles/
    │       └── globals.css         # CSS với transitions & animations
    ├── next.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Cài Đặt & Chạy

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **MongoDB** >= 6.x (local hoặc MongoDB Atlas)
- **npm** hoặc **yarn**

---

### 1️⃣ Clone & chuẩn bị

```bash
git clone <repo-url>
cd movie-app
```

---

### 2️⃣ Cài đặt Backend

```bash
cd backend

# Cài packages
npm install

# Tạo file .env từ mẫu
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movieapp
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/movieapp

JWT_SECRET=your_super_secret_key_change_this   # Đổi key này!
JWT_EXPIRES_IN=7d

PHIM_API_BASE=https://phim.nguonc.com/api
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Chạy backend:

```bash
# Development (với nodemon auto-reload)
npm run dev

# Production
npm start
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

---

### 3️⃣ Cài đặt Frontend

```bash
cd ../frontend

# Cài packages
npm install

# Tạo file .env từ mẫu
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Movie App
```

Chạy frontend:

```bash
# Development
npm run dev

# Build production
npm run build
npm start
```

✅ Frontend sẽ chạy tại: `http://localhost:3000`

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| GET | `/api/auth/me` | Lấy thông tin user | ✅ |
| PUT | `/api/auth/profile` | Cập nhật profile | ✅ |

### Movies (Proxy từ phim.nguonc.com)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/movies` | Phim mới cập nhật |
| GET | `/api/movies/search?q=keyword` | Tìm kiếm |
| GET | `/api/movies/:slug` | Chi tiết phim |
| GET | `/api/movies/type/:type` | Theo loại (phim-le, phim-bo, hoat-hinh) |
| GET | `/api/movies/category/:slug` | Theo thể loại |
| GET | `/api/movies/categories` | Danh sách thể loại |

### Films (Additional endpoints)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/films` | Danh sách phim |
| GET | `/api/films/:id` | Chi tiết phim theo ID |

### Comments (Yêu cầu đăng nhập)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/comments/movie/:slug` | Lấy bình luận phim |
| POST | `/api/comments` | Thêm bình luận |
| PUT | `/api/comments/:id` | Sửa bình luận |
| DELETE | `/api/comments/:id` | Xóa bình luận |

### Favorites (Yêu cầu đăng nhập)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/favorites` | Lấy danh sách yêu thích |
| POST | `/api/favorites` | Thêm vào yêu thích |
| DELETE | `/api/favorites/:slug` | Xóa khỏi yêu thích |
| GET | `/api/favorites/check/:slug` | Kiểm tra trạng thái |

---

## 🎨 UI/UX Features

### Hero Banner
- **20 phim featured** với auto-rotation (30s/phim)
- **YouTube trailer** với auto-play/pause khi scroll
- **Mute by default** với state persistence
- **Smooth transitions** và responsive design
- **Thumbnail strip** với zigzag cutting

### Movie Rows
- **5 types**: MovieRow, NewMovieRow, TopRankRow, SeriesBanner
- **Cắt góc zigzag**: MR ngược với NMR
- **Smooth scrolling** với click disabled khi scroll
- **Hover effects** với scale và shadow transitions
- **Mobile optimized** với dots thu gọn

### Design System
- **Font**: Custom fonts với fallbacks
- **Màu chủ đạo**: `#E50914` (đỏ), `#0A0A0F` (nền tối)
- **Animations**: Smooth transitions, cubic-bezier easing
- **Responsive**: Mobile-first với breakpoints
- **Dark mode**: CSS variables cho consistent theming

---

## 🔧 Công Nghệ Sử Dụng

### Backend
- **Express.js** – REST API framework
- **Mongoose** – MongoDB ODM
- **bcryptjs** – Hash mật khẩu
- **jsonwebtoken** – JWT authentication
- **axios** – Gọi API phim.nguonc.com
- **express-rate-limit** – Rate limiting
- **morgan** – HTTP logging
- **cors** – Cross-origin requests

### Frontend
- **Next.js 14** – React framework (App Router)
- **Tailwind CSS** – Utility-first CSS
- **Axios** – HTTP client
- **js-cookie** – Cookie management
- **lucide-react** – Icons
- **YouTube IFrame API** – Trailer player
- **Intersection Observer** – Scroll-based interactions

---

## 🌐 Deploy

### Backend (Railway / Render / VPS)
```bash
cd backend
npm start
```
> Đừng quên set các biến môi trường trên server!

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```
> Set `NEXT_PUBLIC_API_URL` trong Vercel dashboard.

### Database (MongoDB Atlas)
1. Tạo cluster miễn phí tại [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist IP hoặc cho phép `0.0.0.0/0`
3. Copy connection string vào `MONGODB_URI`

---

## 🎯 Performance Optimizations

- **Lazy Loading** cho images và components
- **Skeleton States** cho smooth loading experience
- **Intersection Observer** cho scroll-based interactions
- **Debounced Search** cho real-time suggestions
- **Optimized Transitions** với hardware acceleration
- **Mobile-First** responsive design
- **Component Splitting** cho better code splitting

---

## 📝 Lưu Ý

- API phim từ `phim.nguonc.com` có thể thay đổi cấu trúc response
- Thay đổi `JWT_SECRET` thành chuỗi ngẫu nhiên dài trước khi deploy
- Đặt `NODE_ENV=production` trong môi trường production
- YouTube trailer cần API key cho production (nếu cần)

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License – Tự do sử dụng cho mục đích học tập và phát triển.
