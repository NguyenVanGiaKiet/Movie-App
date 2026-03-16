const fs = require("fs");

// đọc file json
const data = JSON.parse(fs.readFileSync("episodes.json", "utf8"));

// reset id bắt đầu từ 1
let count = 1;

data.forEach(ep => {
  const idNumber = String(count).padStart(4, "0");
  ep._id = { $oid: `65a40000000000000022${idNumber}` };
  count++;
});

// ghi lại file
fs.writeFileSync("episodes-fixed.json", JSON.stringify(data, null, 2));

console.log("Đã sửa lại toàn bộ _id!");