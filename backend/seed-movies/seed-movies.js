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
  name: "Mộ Đom Đóm",
  origin_name: "火垂るの墓/Grave of the Fireflies",
  slug: "mo-dom-dom",
  content: "Bộ phim được đặt trong bối cảnh giai đoạn cuối chiến tranh thế giới thứ 2 ở Nhật, kể về câu chuyện cảm động về tình anh em của hai đứa trẻ mồ côi là Seita và Setsuko. Hai anh em mất mẹ trong một trận bom dữ dội của không quân Mỹ khi cha của chúng đang chiến đấu cho Hải quân Nhật. Hai đứa bé phải vật lộn giữa nạn đói, giữa sự thờ ơ của những người xung quanh (trong đó có cả người cô họ của mình)...",
  type: "phim-le",
  status: "completed",
  thumb_url: "https://image.tmdb.org/t/p/original/dz17PRgG2ERqpuuE1xbMw2rIYaJ.jpg",
  poster_url: "https://image.tmdb.org/t/p/original/aHaqZpOL7UyVu0nKqp3SMz0o2E1.jpg",
  trailer_url: "https://www.youtube.com/embed/HgDzVFMi238",
  time: "89 phút",
  episode_current: "Full",
  episode_total: "1",
  quality: "HD",
  lang: "Vietsub",
  year: 1988,
  category: [
    "69b26ebd233f020096e6d70e",
    "69b26ebd233f020096e6d718",
    "69b26ebd233f020096e6d715"
  ],
  country: [
    "69b26ebd233f020096e6d71b"
  ],
  director: ["Isao Takahata"],
  actor: ["Tsutomu Tatsumi", "Ayano Shiraishi", "Yoshiko Shinohara"],
  episodes: [
    {
      server_name: "Server Vietsub",
      server_data: [
        {
          name: "Full",
          slug: "full",
          link_embed: "https://embed6.streamc.xyz/embed.php?hash=a4174326d188dd9103ebbe4290a611b9",
        },
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