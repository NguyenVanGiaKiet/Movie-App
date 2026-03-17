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
    name: "Thế Giới Không Lối Thoát (Phần 3)",
    origin_name: "Alice In Borderland (Season 3)",
    slug: "the-gioi-khong-loi-thoat-phan-3",
    content: "Ở Mùa 3, họ đã kết hôn và sống một cuộc sống bình thường, nhưng ký ức về Borderland thi thoảng hiện lên qua giấc mơ hoặc ảo giác.",
    type: "phim-bo",
    status: "completed",
    thumb_url: "https://image.tmdb.org/t/p/original/1B1hllL2Fjap1f2EUsHjBqny3Kg.jpg",
    poster_url: "https://image.tmdb.org/t/p/original/c8WeahQQ9DbKOln4JKTZ5flg1Qe.jpg",
    trailer_url: "https://www.youtube.com/embed/-gPsHwkiXwI",
    time: "50 phút/tập",
    episode_current: "Hoàn tất (8/8)",
    episode_total: "8",
    quality: "HD",
    lang: "Vietsub",
    year: 2025,
    category: [
        "69b26ebd233f020096e6d70c",
        "69b26ebd233f020096e6d718",
        "69b26ebd233f020096e6d713"
    ],
    country: [
        "69b26ebd233f020096e6d71b"
    ],
    director: ["Shinsuke Sato"],
    actor: ["Yamazaki Kento", "Tsuchiya Tao", "Murakami Nijiro"],
    episodes: [
        {
            server_name: "Server Vietsub",
            server_data: [
  {
    "name": "Tập 1",
    "slug": "tap-1",
    "link_embed": "https://embed12.streamc.xyz/embed.php?hash=c34dcd68cf9c87441dc106bf5de115d5"
  },
  {
    "name": "Tập 2",
    "slug": "tap-2",
    "link_embed": "https://embed13.streamc.xyz/embed.php?hash=1300dc9f0c2fe0bc8963044549011235"
  },
  {
    "name": "Tập 3",
    "slug": "tap-3",
    "link_embed": "https://embed11.streamc.xyz/embed.php?hash=653841dfcef2ccd85f4dee1e7961019d"
  },
  {
    "name": "Tập 4",
    "slug": "tap-4",
    "link_embed": "https://embed11.streamc.xyz/embed.php?hash=86c94b7fd8750d45cedc58b935620a76"
  },
  {
    "name": "Tập 5",
    "slug": "tap-5",
    "link_embed": "https://embed12.streamc.xyz/embed.php?hash=da800442baea5c2b8194bb0b5319fad5"
  },
  {
    "name": "Tập 6",
    "slug": "tap-6",
    "link_embed": "https://embed11.streamc.xyz/embed.php?hash=b902fd3cff24c686ae960a12eee71d89"
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