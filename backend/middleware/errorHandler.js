// backend/middleware/errorHandler.js
// Centralized error handler — catches errors thrown anywhere in the app

function errorHandler(err, req, res, next) {
  // Log the error for debugging (not shown to user in production)
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'This record already exists (duplicate entry).' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error. Please try again later.'
      : err.message || 'Something went wrong.';

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
