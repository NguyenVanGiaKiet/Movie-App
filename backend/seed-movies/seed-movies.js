const mongoose = require("mongoose");

// 🔗 Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/movieapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// 📦 Schema đơn giản (bạn có thể chỉnh lại)
const movieSchema = new mongoose.Schema({
    name: String,
    origin_name: String,
    slug: String,
    content: String,
    type: String,
    status: String,
    thumb_url: String,
    poster_url: String,
    trailer_url: String,
    time: String,
    episode_current: String,
    episode_total: String,
    quality: String,
    lang: String,
    year: Number,
    category: [mongoose.Schema.Types.ObjectId],
    country: [mongoose.Schema.Types.ObjectId],
    director: [String],
    actor: [String],
    episodes: Array,
    view: Number,
    is_shown: Boolean,
}, { timestamps: true });

const Movie = mongoose.model("Movie", movieSchema);

// 📥 DATA (bạn có thể thay bằng file JSON hoặc API)
const movieData = {
    name: "Arcane: Liên Minh Huyền Thoại (Phần 2)",
    origin_name: "Arcane: League of Legends (season 2)",
    slug: "arcane-lien-minh-huyen-thoai-phan-2",
    content: "Các liên minh hình thành, lòng trung thành vụn vỡ và mối nguy hiểm mới xuất hiện khi trận chiến giữa Piltover và Zaun mang đến cả vinh quang lẫn đau thương.",
    type: "tv-show",
    status: "completed",
    thumb_url: "https://image.tmdb.org/t/p/original/oTGEwkp1mPgWNMgVSM53TWfzgSc.jpg",
    poster_url: "https://image.tmdb.org/t/p/original/27yH7q4nYadsbF7wMUt5xQG2tYN.jpg",
    trailer_url: "https://www.youtube.com/embed/ysqiEC6bLUI",
    time: "40 phút/tập",
    episode_current: "Hoàn tất (9/9)",
    episode_total: "9",
    quality: "HD",
    lang: "Vietsub",
    year: 2024,
    category: [
        "69b26ebd233f020096e6d70c",
        "69b26ebd233f020096e6d70d",
        "69b26ebd233f020096e6d70e",
        "69b26ebd233f020096e6d722"
    ],
    country: [
        "69b26ebd233f020096e6d718",
        "69b26ebd233f020096e6d71e"
    ],
    director: ["Pascal Charrue","Arnaud Delord"],
    actor: ["Hailee Steinfeld", "Kevin Alejandro", "Jason Spisak"],
    episodes: [
        {
            server_name: "Server Vietsub",
            server_data: [
  {
    "name": "Tập 1",
    "slug": "tap-1",
    "link_embed": "https://embed12.streamc.xyz/embed.php?hash=12850906d46de144a8f37e0961528388"
  },
  {
    "name": "Tập 2",
    "slug": "tap-2",
    "link_embed": "https://embed11.streamc.xyz/embed.php?hash=ef92ba3c319352b44c7d8467067d40be"
  },
  {
    "name": "Tập 3",
    "slug": "tap-3",
    "link_embed": "https://embed11.streamc.xyz/embed.php?hash=1594db360361adedbc7e53dc31a1a11e"
  },
  {
    "name": "Tập 4",
    "slug": "tap-4",
    "link_embed": "https://embed15.streamc.xyz/embed.php?hash=837a633b4e13c9a8630df609f25f7a0c"
  },
  {
    "name": "Tập 5",
    "slug": "tap-5",
    "link_embed": "https://embed17.streamc.xyz/embed.php?hash=e4a5cd8b52f8564da8727a4d54cd376c"
  },
  {
    "name": "Tập 6",
    "slug": "tap-6",
    "link_embed": "https://embed14.streamc.xyz/embed.php?hash=79536b30cc9858cb4466562a363cea51"
  },
  {
    "name": "Tập 7",
    "slug": "tap-7",
    "link_embed": "https://embed14.streamc.xyz/embed.php?hash=6e36df188ae4d39b89c3c61cec199f3c"
  },
  {
    "name": "Tập 8",
    "slug": "tap-8",
    "link_embed": "https://embed17.streamc.xyz/embed.php?hash=e9bbe768667e54ae6b8f4c0a1bc04f0b"
  },
  {
    "name": "Tập 9",
    "slug": "tap-9",
    "link_embed": "https://embed14.streamc.xyz/embed.php?hash=e541651f45b7206c7b35c89852a277be"
  }
],
        },
    ],
    view: 0,
    is_shown: true,
};

// 🚀 Hàm insert
async function insertMovie() {
    try {
        const exist = await Movie.findOne({ slug: movieData.slug });

        if (exist) {
            console.log("❌ Phim đã tồn tại");
            return;
        }

        const movie = new Movie(movieData);
        await movie.save();

        console.log("✅ Thêm phim thành công");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

insertMovie();