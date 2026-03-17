const fs = require("fs");

// đọc file txt chứa link
const links = fs
  .readFileSync("onepiece-clean.txt", "utf8")
  .split("\n")
  .map(l => l.trim())
  .filter(Boolean);

const episodes = links.map((link, index) => {

  return {
    name: `Tập ${index + 1}`,
    slug: `tap-${index + 1}`,
    link_embed: link
  };
});

// ghi ra file json
fs.writeFileSync(
  "episodes.json",
  JSON.stringify(episodes, null, 2),
  "utf8"
);

console.log("Đã tạo JSON thành công!");