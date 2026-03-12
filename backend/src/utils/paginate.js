// Build paginated response giống cấu trúc phim.nguonc.com
function paginate({ items, page, limit, total }) {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    paginate: {
      current_page: page,
      total_page: totalPages,
      total_items: total,
      per_page: limit,
    },
  };
}

module.exports = { paginate };
