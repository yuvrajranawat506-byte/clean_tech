// backend/middleware/admin.js
// Admin-only middleware — must be used AFTER authMiddleware
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
}

module.exports = adminMiddleware;
