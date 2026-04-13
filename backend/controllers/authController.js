const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { username, password } = req.body;

  // Find user by username
  const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

  if (users.length === 0) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = users[0];

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({ message: 'Account is deactivated' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const payload = {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
    full_name: user.full_name
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: payload
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // Fetch fresh data from DB using ID from token
  const [users] = await db.execute(
    'SELECT user_id, username, full_name, role, email, is_active, created_at FROM users WHERE user_id = ?',
    [req.user.user_id]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(users[0]);
});

module.exports = {
  login,
  getMe
};
