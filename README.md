# 🎬 CineStream – Web App Xem Phim Trực Tuyến

Ứng dụng xem phim hiện đại với giao diện Netflix-style, tích hợp API từ [phim.nguonc.com](https://phim.nguonc.com).

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square&logo=mongodb)

---

## ✨ Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| 🏠 Trang chủ | Hiển thị phim mới, phim lẻ, phim bộ, hoạt hình |
| 🔍 Tìm kiếm | Tìm kiếm phim theo tên |
| 🎬 Chi tiết phim | Thông tin, diễn viên, đạo diễn, thể loại |
| ▶️ Xem phim | Trình phát video inline với chọn tập |
| 🎞️ Trailer | Xem trailer trong modal |
| 🔐 Xác thực | Đăng ký / Đăng nhập bằng JWT |
| ❤️ Yêu thích | Thêm/xóa phim yêu thích |
| 📋 Danh sách | Quản lý danh sách phim đã lưu |
| 📱 Responsive | Hoạt động tốt trên mọi thiết bị |
| 🌙 Dark mode | Giao diện tối mặc định |

---

## 🏗️ Kiến Trúc

```
movie-app/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Kết nối MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.js    # Xử lý đăng ký/đăng nhập
│   │   │   ├── movieController.js   # Proxy API phim
│   │   │   └── favoriteController.js # Quản lý yêu thích
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js         # Schema người dùng
│   │   │   └── Favorite.js     # Schema yêu thích
│   │   ├── routes/
│   │   │   ├── auth.js         # /api/auth/*
│   │   │   ├── movies.js       # /api/movies/*
│   │   │   └── favorites.js    # /api/favorites/*
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.js           # Root layout
    │   │   ├── page.js             # Trang chủ
    │   │   ├── search/page.js      # Tìm kiếm
    │   │   ├── movie/[slug]/page.js # Chi tiết phim
    │   │   ├── login/page.js       # Đăng nhập
    │   │   ├── register/page.js    # Đăng ký
    │   │   ├── favorites/page.js   # Yêu thích
    │   │   └── movies/type/[type]/page.js
    │   ├── components/
    │   │   ├── Navbar.js           # Thanh điều hướng
    │   │   ├── Hero.js             # Banner trang chủ
    │   │   ├── MovieCard.js        # Card phim
    │   │   └── MovieRow.js         # Hàng phim scroll ngang
    │   ├── context/
    │   │   └── AuthContext.js      # Auth state management
    │   ├── lib/
    │   │   └── api.js              # Axios instances & API calls
    │   └── styles/
    │       └── globals.css
    ├── next.config.js
    ├── tailwind.config.js
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
NEXT_PUBLIC_APP_NAME=CineStream
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

### Favorites (Yêu cầu đăng nhập)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/favorites` | Lấy danh sách yêu thích |
| POST | `/api/favorites` | Thêm vào yêu thích |
| DELETE | `/api/favorites/:slug` | Xóa khỏi yêu thích |
| GET | `/api/favorites/check/:slug` | Kiểm tra trạng thái |

---

## 🎨 UI/UX

- **Font**: Bebas Neue (display) + DM Sans (body)
- **Màu chủ đạo**: `#E50914` (đỏ Netflix), `#0A0A0F` (nền tối)
- **Animations**: Fade-in, slide-up, scale-in, shimmer skeleton
- **Responsive**: Mobile-first, breakpoints sm/md/lg/xl
- **Dark mode**: Mặc định dark, CSS variables

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
- **axios** – HTTP client
- **js-cookie** – Cookie management
- **react-hot-toast** – Notifications
- **lucide-react** – Icons
- **clsx** – Conditional classes

---

## 🌐 Deploy

### Backend (Railway / Render / VPS)
```bash
cd backend
npm run build  # Nếu có
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

## 📝 Lưu Ý

- API phim từ `phim.nguonc.com` có thể thay đổi cấu trúc response. Kiểm tra API docs tại [phim.nguonc.com/api-document](https://phim.nguonc.com/api-document)
- Thay đổi `JWT_SECRET` thành chuỗi ngẫu nhiên dài trước khi deploy
- Đặt `NODE_ENV=production` trong môi trường production

---

## 📄 License

MIT License – Tự do sử dụng cho mục đích học tập và phát triển.
