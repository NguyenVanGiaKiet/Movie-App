// Tạo slug từ tiêu đề tiếng Việt
function slugify(text) {
  const map = {
    à:'a',á:'a',ả:'a',ã:'a',ạ:'a',
    ă:'a',ắ:'a',ặ:'a',ằ:'a',ẳ:'a',ẵ:'a',
    â:'a',ấ:'a',ậ:'a',ầ:'a',ẩ:'a',ẫ:'a',
    è:'e',é:'e',ẻ:'e',ẽ:'e',ẹ:'e',
    ê:'e',ế:'e',ệ:'e',ề:'e',ể:'e',ễ:'e',
    ì:'i',í:'i',ỉ:'i',ĩ:'i',ị:'i',
    ò:'o',ó:'o',ỏ:'o',õ:'o',ọ:'o',
    ô:'o',ố:'o',ộ:'o',ồ:'o',ổ:'o',ỗ:'o',
    ơ:'o',ớ:'o',ợ:'o',ờ:'o',ở:'o',ỡ:'o',
    ù:'u',ú:'u',ủ:'u',ũ:'u',ụ:'u',
    ư:'u',ứ:'u',ự:'u',ừ:'u',ử:'u',ữ:'u',
    ỳ:'y',ý:'y',ỷ:'y',ỹ:'y',ỵ:'y',
    đ:'d',
  };
  return text
    .toLowerCase()
    .split('')
    .map(c => map[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = { slugify };
