const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const [users] = await db.query('SELECT user_id, username, full_name, role, email, is_active, created_at FROM users ORDER BY username ASC');
  res.json(users);
});

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { username, password, full_name, role, email } = req.body;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  try {
    const [result] = await db.execute(
      `INSERT INTO users (username, password_hash, full_name, role, email, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
      [username, password_hash, full_name, role || 'cashier', email || null]
    );

    res.status(201).json({ 
      message: 'User created successfully', 
      user_id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    throw error;
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { full_name, role, email, is_active } = req.body;
  const userId = req.params.id;

  const [result] = await db.execute(
    `UPDATE users SET full_name = ?, role = ?, email = ?, is_active = ? WHERE user_id = ?`,
    [full_name, role, email || null, is_active !== undefined ? is_active : true, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ message: 'User updated successfully' });
});

module.exports = {
  getUsers,
  createUser,
  updateUser
};
