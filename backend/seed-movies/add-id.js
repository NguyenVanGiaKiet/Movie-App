const fs = require("fs");

// đọc file json
const data = JSON.parse(fs.readFileSync("naruto-shippuden.json", "utf8"));

let count = 1;

data.episodes[0].server_data = data.episodes[0].server_data.map(ep => {
  const idNumber = String(count).padStart(4, "0");

  const newEp = {
    _id: { $oid: `65a40000000000000017${idNumber}` },
    ...ep
  };

  count++;
  return newEp;
});

// ghi lại file
fs.writeFileSync(
  "naruto-shippuden-with-id.json",
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log("Đã thêm _id cho tất cả tập!");