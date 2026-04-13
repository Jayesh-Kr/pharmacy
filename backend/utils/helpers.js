/**
 * Format a date to YYYY-MM-DD for MySQL
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDateForMySQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Handle async errors in Express routes
 * Wraps async functions to pass errors to Express error handler
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format validation errors from express-validator
 * @param {Array} errors - Array of error objects from express-validator
 * @returns {Object} Formatted error object
 */
const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  errors.forEach(err => {
    if (!formattedErrors[err.path]) {
      formattedErrors[err.path] = err.msg;
    }
  });
  return formattedErrors;
};

module.exports = {
  formatDateForMySQL,
  asyncHandler,
  formatValidationErrors
};
