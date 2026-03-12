exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
};
