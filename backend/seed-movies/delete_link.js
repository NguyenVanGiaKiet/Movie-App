const fs = require('fs');

// đọc file
const data = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

// function xử lý 1 movie
const clearEmbedLinks = (movie) => {
  if (!movie.episodes) return movie;

  movie.episodes.forEach(server => {
    if (!server.server_data) return;

    server.server_data.forEach(ep => {
      ep.link_embed = ""; // 👈 set rỗng
    });
  });

  return movie;
};

// xử lý cả 2 trường hợp
let result;

if (Array.isArray(data)) {
  result = data.map(clearEmbedLinks);
} else {
  result = clearEmbedLinks(data);
}

// ghi file mới
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));

console.log('✅ Done!');