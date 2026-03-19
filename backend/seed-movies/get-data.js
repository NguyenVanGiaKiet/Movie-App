const fs = require("fs");

// đọc file nguồn
const rawData = fs.readFileSync("input.json", "utf-8");
const inputs = JSON.parse(rawData);

// hàm lấy số tập
const getEpisodeNumber = (str) => parseInt(str?.replace(/\D/g, "") || 0);

// convert string -> array
const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.split(",").map(s => s.trim());
};

const outputs = inputs.map(item => {
  const currentEp = getEpisodeNumber(item.current_episode);

  // 👇 thêm điều kiện FULL
  const isCompleted =
    item.current_episode === "FULL" ||
    currentEp === item.total_episodes;

  return {
    name: item.name,
    origin_name: item.original_name,
    slug: item.slug,
    content: item.description,

    type: item.total_episodes > 1 ? "phim-bo" : "phim-le",
    status: isCompleted ? "completed" : "ongoing",

    thumb_url: item.thumb_url,
    poster_url: item.poster_url,
    trailer_url: "https://www.youtube.com",

    time: item.time,
    episode_current: item.current_episode,
    episode_total: item.total_episodes,

    quality: item.quality,
    lang: item.language,
    year: 2026,

    director: toArray(item.director),
    actor: toArray(item.casts)
  };
});

// ghi file mới
fs.writeFileSync("output.json", JSON.stringify(outputs, null, 2), "utf-8");

console.log("✅ Đã convert xong!");