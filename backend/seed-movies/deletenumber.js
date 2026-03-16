const fs = require("fs");

// đọc file
const lines = fs.readFileSync("onepiece.txt", "utf8").split("\n");

// xóa số + dấu |
const cleaned = lines.map(line => line.replace(/^\d+\|/, ""));

// ghi file mới
fs.writeFileSync("onepiece-clean.txt", cleaned.join("\n"));

console.log("Đã xóa số và dấu |");