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
    "name": "Bóng Ma Anh Quốc: Người Bất Tử",
    "origin_name": "Peaky Blinders: The Immortal Man",
    "slug": "bong-ma-anh-quoc-nguoi-bat-tu",
    "content": "Cillian Murphy tái hợp với nhà sáng tạo Steven Knight trong bộ phim điện ảnh hoành tráng này, nơi Tommy Shelby và cậu con trai xa cách phải đối mặt với hỗn loạn của Thế chiến II.",
    "type": "phim-le",
    "status": "completed",
    "thumb_url": "https://image.tmdb.org/t/p/original/dz17PRgG2ERqpuuE1xbMw2rIYaJ.jpg",
    "poster_url": "https://image.tmdb.org/t/p/original/aHaqZpOL7UyVu0nKqp3SMz0o2E1.jpg",
    "trailer_url": "https://www.youtube.com/embed/HgDzVFMi238",
    "time": "89 phút",
    "episode_current": "Full",
    "episode_total": "1",
    "quality": "HD",
    "lang": "Vietsub",
    "year": 1988,
    "director": [
      "Isao Takahata"
    ],
    "actor": [
      "Tsutomu Tatsumi",
      "Ayano Shiraishi",
      "Yoshiko Shinohara",
      "Akemi Yamaguchi",
      "Cyril McLaglen"
    ],
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
    episodes: [
        {
            server_name: "Server Vietsub",
            server_data: [
  {
    "name": "Full",
    "slug": "full",
    "link_embed": "https://embed.streamc.xyz/embed.php?hash=40b8a4663475da43d8f66c571a618f54"
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