const fs = require("fs");

// đọc file txt chứa link
const links = fs
  .readFileSync("onepiece.txt", "utf8")
  .split("\n")
  .map(l => l.trim())
  .filter(Boolean);

let startId = 1;

const episodes = links.map((link, index) => {
  const idNumber = String(startId + index).padStart(4, "0");

  return {
    _id: { $oid: `65a40000000000000006${idNumber}` },
    name: `Tập ${index + 1}`,
    slug: `tap-${index + 1}`,
    filename: "",
    link_embed: link,
    link_m3u8: ""
  };
});

// ghi ra file json
fs.writeFileSync(
  "episodes.json",
  JSON.stringify(episodes, null, 2),
  "utf8"
);

console.log("Đã tạo JSON thành công!");